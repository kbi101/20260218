package com.pao.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pao.model.Organization;
import com.pao.model.Person;
import com.pao.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PersonEnrichmentService {

    private final PersonService personService;
    private final OrganizationService organizationService;
    private final OrganizationEnrichmentService organizationEnrichmentService;
    private final OrganizationRepository organizationRepository;
    private final SystemSettingsService settingsService;
    private final AIService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public PersonEnrichmentService(PersonService personService,
            OrganizationService organizationService,
            OrganizationEnrichmentService organizationEnrichmentService,
            OrganizationRepository organizationRepository,
            SystemSettingsService settingsService,
            AIService aiService) {
        this.personService = personService;
        this.organizationService = organizationService;
        this.organizationEnrichmentService = organizationEnrichmentService;
        this.organizationRepository = organizationRepository;
        this.settingsService = settingsService;
        this.aiService = aiService;
    }

    @Transactional
    public Person matchOrganization(Long personId) {
        Person person = personService.getPerson(personId);
        settingsService.logActivity("BACKEND", "MATCH_ORG", "INFO", "Starting organization discovery for: " + person.getFirstName() + " " + person.getLastName(), "");

        try {
            String discoveryPrompt = String.format(
                    "Based on the following professional info, identify the official name of the company this person currently works for. " +
                    "Return as a strict JSON object with a single key 'company_name'. If unsure, return empty string. " +
                    "Info: Name: %s %s, Job: %s, Email: %s, Summary: %s",
                    person.getFirstName(), person.getLastName(), person.getJob(), person.getEmail(),
                    person.getDescription());

            String discoveryJson = aiService.callLLM(discoveryPrompt, true);
            JsonNode discoveryResult = objectMapper.readTree(aiService.cleanJson(discoveryJson));
            String companyName = discoveryResult.path("company_name").asText("").trim();

            if (companyName.isEmpty()) {
                settingsService.logActivity("BACKEND", "MATCH_ORG", "WARN", "No company name identified for person: " + personId, "");
                return person;
            }

            Optional<Organization> existingOrg = organizationRepository.findByNameIgnoreCase(companyName);
            Organization matchedOrg = null;

            if (existingOrg.isPresent()) {
                matchedOrg = existingOrg.get();
                settingsService.logActivity("BACKEND", "MATCH_ORG", "INFO", "Local match found: " + companyName, "ID: " + matchedOrg.getId());
            } else {
                settingsService.logActivity("BACKEND", "MATCH_ORG", "INFO", "Searching MCP for: " + companyName, "");
                Map<String, Object> toolArgs = new HashMap<>();
                toolArgs.put("name", companyName);
                String mcpOutput = callMcpTool("organization_enrichment", toolArgs);

                if (mcpOutput != null && !mcpOutput.isEmpty()) {
                    String nameExtractionPrompt = "Extract the official, canonical company name from this discovery report: " + mcpOutput + "\nReturn as a strict JSON object with key 'official_name'.";
                    String nameJson = aiService.callLLM(nameExtractionPrompt, true);
                    String officialName = objectMapper.readTree(aiService.cleanJson(nameJson)).path("official_name")
                            .asText(companyName);

                    existingOrg = organizationRepository.findByNameIgnoreCase(officialName);
                    if (existingOrg.isPresent()) {
                        matchedOrg = existingOrg.get();
                    } else {
                        matchedOrg = new Organization();
                        matchedOrg.setName(officialName);
                        matchedOrg.setType("COMPANY");
                        matchedOrg = organizationService.createOrganization(matchedOrg);
                        matchedOrg = organizationEnrichmentService.enrichOrganization(matchedOrg.getId());
                        settingsService.logActivity("BACKEND", "MATCH_ORG", "INFO", "Created and enriched new organization: " + officialName, "");
                    }
                }
            }

            if (matchedOrg != null) {
                if (!person.getOrganizations().contains(matchedOrg)) {
                    person.getOrganizations().add(matchedOrg);
                    settingsService.logActivity("BACKEND", "MATCH_ORG", "SUCCESS", "Associated person " + person.getFirstName() + " with " + matchedOrg.getName(), "");
                    return personService.updatePerson(personId, person);
                }
            }

        } catch (Exception e) {
            settingsService.logActivity("BACKEND", "MATCH_ORG", "ERROR", "Failed to match org for " + personId, e.getMessage());
        }

        return person;
    }

    public Person enrichPerson(Long id) {
        Person person = personService.getPerson(id);
        settingsService.logActivity("BACKEND", "ENRICH_PERSON", "INFO", "Enriching person: " + person.getFirstName() + " " + person.getLastName(), "");

        try {
            String extractionPrompt = String.format(
                    "Extract the name, company, title, email, and phone number from this person record: " +
                    "Name: %s %s, Job: %s, Email: %s, Address: %s. " +
                    "Return as a strict JSON object with keys: 'name', 'company', 'title', 'email', 'phone'. " +
                    "Keep fields as empty strings if not found.",
                    person.getFirstName(), person.getLastName(), person.getJob(), person.getEmail(),
                    person.getAddress());

            String extractionJson = aiService.callLLM(extractionPrompt, true);
            JsonNode entities = objectMapper.readTree(aiService.cleanJson(extractionJson));

            Map<String, Object> toolArgs = new HashMap<>();
            toolArgs.put("name", entities.path("name").asText(person.getFirstName() + " " + person.getLastName()));
            toolArgs.put("company", entities.path("company").asText(""));
            toolArgs.put("title", entities.path("title").asText(""));
            toolArgs.put("email", entities.path("email").asText(""));
            toolArgs.put("phone", entities.path("phone").asText(""));

            String mcpOutput = callMcpTool("people_enrichment", toolArgs);

            if (mcpOutput == null || mcpOutput.isEmpty()) {
                settingsService.logActivity("BACKEND", "ENRICH_PERSON", "WARN", "MCP Tool returned no data", "");
                return person;
            }

            JsonNode enrichResult = objectMapper.readTree(aiService.cleanJson(mcpOutput));
            JsonNode data = enrichResult.path("enriched_data");

            if (data.hasNonNull("title") || data.hasNonNull("company")) {
                String job = data.path("title").asText("") + " at " + data.path("company").asText("");
                if (person.getJob() == null || person.getJob().isEmpty()) person.setJob(job);
            }
            if (data.hasNonNull("email") && (person.getEmail() == null || person.getEmail().isEmpty())) {
                String email = data.path("email").asText();
                if (!"Not Found".equalsIgnoreCase(email)) person.setEmail(email);
            }
            if (data.hasNonNull("linkedin_url")) {
                String liUrl = data.path("linkedin_url").asText();
                if (!"Not Found".equalsIgnoreCase(liUrl)) person.getSocialLinks().put("LinkedIn", liUrl);
            }

            String summaryPrompt = String.format(
                    "Summarize profile for %s %s in professional Markdown. Data: %s",
                    person.getFirstName(), person.getLastName(), mcpOutput);

            String summary = aiService.callLLM(summaryPrompt, false);
            if (summary != null && !summary.isEmpty()) person.setDescription(summary);

            settingsService.logActivity("BACKEND", "ENRICH_PERSON", "SUCCESS", "Profile enriched for: " + person.getFirstName(), "Payload size: " + mcpOutput.length());
            return personService.updatePerson(id, person);

        } catch (Exception e) {
            settingsService.logActivity("BACKEND", "ENRICH_PERSON", "ERROR", "Enrichment failed for " + person.getFirstName(), e.getMessage());
            return person;
        }
    }

    public String generateElevatorPitch(String bullets, String targetRole, Person person) {
        String fullName = person.getFirstName() + " " + person.getLastName();
        String context = (person.getDescription() != null && !person.getDescription().isEmpty())
                ? "Professional background:\n" + person.getDescription()
                : "";

        String prompt = String.format(
                "Based on the following experience points: [%s]\n\n" +
                        "Specifically targeting the role of: [%s]\n\n" +
                        "And the professional background of %s:\n%s\n\n" +
                        "Craft a concise, engaging 30-second elevator pitch suitable for self-introduction. "
                        +
                        "Return ONLY the pitch text.",
                bullets, targetRole, fullName, context);

        try {
            return aiService.callLLM(prompt, false);
        } catch (Exception e) {
            settingsService.logActivity("BACKEND", "PITCH_GEN", "ERROR", "Failed to generate pitch", e.getMessage());
            return "Failed to generate pitch. Please try again.";
        }
    }

    private String callMcpTool(String toolName, Map<String, Object> arguments) throws Exception {
        // Redundant but kept for compatibility
        return null;
    }
}
