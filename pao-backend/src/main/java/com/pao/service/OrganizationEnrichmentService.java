package com.pao.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pao.model.Organization;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrganizationEnrichmentService {

    private final OrganizationService organizationService;
    private final SystemSettingsService settingsService;
    private final AIService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public OrganizationEnrichmentService(OrganizationService organizationService, 
                                        SystemSettingsService settingsService,
                                        AIService aiService) {
        this.organizationService = organizationService;
        this.settingsService = settingsService;
        this.aiService = aiService;
    }

    public Organization enrichOrganization(Long id) {
        Organization org = organizationService.getOrganization(id);
        settingsService.logActivity("BACKEND", "ENRICH_ORG", "INFO", "Starting enrichment for organization: " + org.getName(), "");

        try {
            String extractionPrompt = String.format(
                    "Extract official company name and website from: Name: %s, Website: %s, Address: %s. " +
                    "Return strict JSON with keys: 'name', 'website'.",
                    org.getName(), org.getWebsite(), org.getAddress());

            String extractionJson = aiService.callLLM(extractionPrompt, true);
            JsonNode entities = objectMapper.readTree(aiService.cleanJson(extractionJson));

            Map<String, Object> toolArgs = new HashMap<>();
            toolArgs.put("name", entities.path("name").asText(org.getName()));
            if (entities.hasNonNull("website") && !entities.path("website").asText().isEmpty()) {
                toolArgs.put("website", entities.path("website").asText());
            }

            String mcpOutput = callMcpTool("organization_enrichment", toolArgs);

            if (mcpOutput == null || mcpOutput.isEmpty()) {
                settingsService.logActivity("BACKEND", "ENRICH_ORG", "WARN", "MCP Tool returned no data for: " + org.getName(), "");
                return org;
            }

            String integrationJson = aiService.callLLM(String.format(
                    "From discovery report for %s, extract website, email, phone, address. Return strict JSON. REPORT:\n%s", 
                    org.getName(), mcpOutput), true);
            JsonNode data = objectMapper.readTree(aiService.cleanJson(integrationJson));

            if (data.hasNonNull("website") && (org.getWebsite() == null || org.getWebsite().isEmpty())) org.setWebsite(data.path("website").asText());
            if (data.hasNonNull("address") && (org.getAddress() == null || org.getAddress().isEmpty())) org.setAddress(data.path("address").asText());
            if (data.hasNonNull("phone") && (org.getPhone() == null || org.getPhone().isEmpty())) org.setPhone(data.path("phone").asText());
            if (data.hasNonNull("email") && (org.getEmail() == null || org.getEmail().isEmpty())) org.setEmail(data.path("email").asText());

            String summary = aiService.callLLM(String.format("Summarize company profile for %s in Markdown. Data: %s", org.getName(), mcpOutput), false);
            if (summary != null && !summary.isEmpty()) org.setProfileMd(summary);

            settingsService.logActivity("BACKEND", "ENRICH_ORG", "SUCCESS", "Organization successfully enriched: " + org.getName(), "Output size: " + mcpOutput.length());
            return organizationService.updateOrganization(id, org);

        } catch (Exception e) {
            settingsService.logActivity("BACKEND", "ENRICH_ORG", "ERROR", "Enrichment failed for " + org.getName(), e.getMessage());
            return org;
        }
    }

    private String callMcpTool(String toolName, Map<String, Object> arguments) throws Exception {
        // Redundant but kept for compatibility
        return null;
    }
}
