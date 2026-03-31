package com.pao.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pao.model.Person;
import com.pao.model.ResumeSnippet;
import com.pao.repository.PersonRepository;
import com.pao.repository.ResumeSnippetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ResumeSnippetService {

    private final ResumeSnippetRepository resumeSnippetRepository;
    private final PersonRepository personRepository;
    private final SystemSettingsService settingsService;
    private final AIService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public ResumeSnippetService(ResumeSnippetRepository resumeSnippetRepository,
            PersonRepository personRepository,
            SystemSettingsService settingsService,
            AIService aiService) {
        this.resumeSnippetRepository = resumeSnippetRepository;
        this.personRepository = personRepository;
        this.settingsService = settingsService;
        this.aiService = aiService;
    }

    public List<ResumeSnippet> extractSnippets(Long personId, String resumeContent) throws Exception {
        if (personId == null) throw new IllegalArgumentException("PersonId cannot be null");
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new RuntimeException("Person not found"));

        String prompt = "You are an exhaustive, high-precision resume parser. Your goal is to break down the provided resume into individual 'snippets' representing EVERY piece of information in the document. DO NOT SKIP ANY SECTIONS.\n\n" +
                "Categorize every relevant detail into one of these types: " +
                "'SUMMARY', 'CORE_COMPETENCY', 'EDUCATION', 'LEADERSHIP', 'EXPERIENCE', 'COMMUNICATION'.\n\n" +
                "STRATEGIC INSTRUCTIONS:\n" +
                "1. HEADER: You MUST extract the CONTACT INFORMATION at the top (name, phone, email, location, LinkedIn) as a 'COMMUNICATION' snippet.\n" +
                "2. EXPERIENCES: If there are 10 jobs in the resume, you MUST extract 10 EXPERIENCE objects.\n" +
                "3. EDUCATION: If there are 5 schools/degrees, you MUST extract 5 EDUCATION objects.\n" +
                "4. PROJECTS: Extract EVERY project as a separate snippet.\n\n" +
                "For EACH object, use exactly these keys:\n" +
                "- 'type': One of the categories above.\n" +
                "- 'name': Identifier (e.g., project name, school, skill set).\n" +
                "- 'company': Organization or company name.\n" +
                "- 'role': Job title or student degree.\n" +
                "- 'duration': Date range.\n" +
                "- 'briefing': A detailed description of specifically what was done. MUST NOT BE EMPTY.\n" +
                "- 'technicalStacks': Comma-separated list of technologies used.\n" +
                "- 'roi': Specific impact, quantitative results, or major achievements.\n\n" +
                "Output MUST be a strict JSON array of objects. [ { ... }, { ... } ]\n\n" +
                "RESUME CONTENT:\n" + resumeContent;

        settingsService.logActivity("BACKEND", "EXTRACTION", "INFO", "Sending prompt to LLM", prompt);
        String jsonResult = aiService.callLLM(prompt, true);
        return parseAndSaveSnippets(personId, jsonResult);
    }

    public List<ResumeSnippet> parseAndSaveSnippets(Long personId, String jsonResult) throws Exception {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new RuntimeException("Person not found"));
        
        String cleaned = aiService.cleanJson(jsonResult);
        settingsService.logActivity("BACKEND", "EXTRACTION", "INFO", "Cleaned JSON result", cleaned);
        
        JsonNode rootNode = objectMapper.readTree(cleaned);
        List<JsonNode> snippetNodes = new ArrayList<>();

        if (rootNode.isArray()) {
            for (JsonNode node : rootNode) snippetNodes.add(node);
        } else if (rootNode.isObject()) {
            // Try to find an array field (e.g., "snippets", "items", "data")
            boolean foundArray = false;
            if (rootNode.has("snippets") && rootNode.get("snippets").isArray()) {
                for (JsonNode node : rootNode.get("snippets")) snippetNodes.add(node);
                foundArray = true;
            } else {
                for (JsonNode field : rootNode) {
                    if (field.isArray()) {
                        for (JsonNode node : field) snippetNodes.add(node);
                        foundArray = true;
                        break;
                    }
                }
            }
            
            // If No array was found, but this object ITSELF looks like a snippet
            if (!foundArray && (rootNode.has("type") || rootNode.has("briefing"))) {
                snippetNodes.add(rootNode);
                settingsService.logActivity("BACKEND", "EXTRACTION", "INFO", "Interpreting single object as snippet", "");
            }
        }

        List<ResumeSnippet> newSnippets = new ArrayList<>();
        if (!snippetNodes.isEmpty()) {
            settingsService.logActivity("BACKEND", "EXTRACTION", "INFO", "Processing " + snippetNodes.size() + " items", "");
            for (int i = 0; i < snippetNodes.size(); i++) {
                JsonNode node = snippetNodes.get(i);
                ResumeSnippet s = new ResumeSnippet();
                String extractedType = node.path("type").asText("EXPERIENCE").toUpperCase().trim();
                if (extractedType.isEmpty() || extractedType.equals("NULL")) {
                    extractedType = "EXPERIENCE";
                }
                s.setType(extractedType);
                s.setName(node.path("name").asText(""));
                s.setCompany(node.path("company").asText(""));
                s.setRole(node.path("role").asText(""));
                s.setDuration(node.path("duration").asText(""));
                s.setBriefing(node.path("briefing").asText(""));
                s.setTechnicalStacks(node.path("technicalStacks").asText(""));
                s.setRoi(node.path("roi").asText(""));
                s.setPerson(person);
                
                settingsService.logActivity("BACKEND", "EXTRACTION", "INFO", "Saving snippet " + (i+1) + " of " + snippetNodes.size(), s.getName());
                newSnippets.add(resumeSnippetRepository.save(s));
            }
        } else {
            settingsService.logActivity("BACKEND", "EXTRACTION", "ERROR", "No JSON array or snippet object found in LLM response", cleaned);
        }
        return newSnippets;
    }

    /**
     * Composes a professional Markdown resume by selecting the most appropriate snippets
     * matching the Job Description. 
     */
    public String composeResume(List<ResumeSnippet> snippets, String jobDescription) throws Exception {
        StringBuilder snippetsContext = new StringBuilder();
        for (ResumeSnippet s : snippets) {
            if ("COMMUNICATION".equalsIgnoreCase(s.getType())) {
                snippetsContext.append("### [COMMUNICATION]\n");
                snippetsContext.append("- Name: ").append(s.getName()).append("\n");
                snippetsContext.append("- Email / Date: ").append(s.getDuration()).append("\n");
                snippetsContext.append("- Phone / Role: ").append(s.getRole()).append("\n");
                snippetsContext.append("- Location / Company: ").append(s.getCompany()).append("\n");
                snippetsContext.append("- LinkedIn / Briefing: ").append(s.getBriefing()).append("\n\n");
            } else {
                snippetsContext.append(String.format("### [%s] ID:%d - %s\n", s.getType(), s.getId() != null ? s.getId() : 0, s.getName()));
                if (s.getCompany() != null) snippetsContext.append("- Organization: ").append(s.getCompany()).append("\n");
                if (s.getRole() != null) snippetsContext.append("- Job Title/Role: ").append(s.getRole()).append("\n");
                if (s.getDuration() != null) snippetsContext.append("- Date Range: ").append(s.getDuration()).append("\n");
                snippetsContext.append("- Key Details: ").append(s.getBriefing()).append("\n");
                if (s.getRoi() != null && !s.getRoi().isEmpty()) snippetsContext.append("- IMPACT/ROI (MUST EMPHASIZE): ").append(s.getRoi()).append("\n");
                if (s.getTechnicalStacks() != null) snippetsContext.append("- Technology: ").append(s.getTechnicalStacks()).append("\n\n");
            }
        }

        String prompt = "You are an Elite Executive Resume Architect. Your mission is to construct a tailored, industry-leading Markdown resume.\n\n" +
                "CRITICAL DATA SAFETY RULES:\n" +
                "1. NO PLACEHOLDERS: NEVER use names like 'John Doe' or fake contact info. ONLY use data from 'COMMUNICATION' snippets.\n" +
                "2. NO FABRICATION: Use ONLY the provided snippets. Do not invent achievements.\n" +
                "3. TAILORING: Rephrase snippets using the EXACT terminology from the Job Description. Integrate modern AI concepts (like Agentic LLMs, RAG, GraphRAG, ROI metrics) prominently if they exist in snippets.\n" +
                "4. CHRONOLOGICAL COMPLETENESS: You MUST include ALL experience/project snippets from CANDIDATE SNIPPETS in the Professional Experience section to avoid gaps. For older roles (like 1997-2005), you may summarize them more briefly, but they MUST be listed. ALWAYS include the MOST RECENT (AI Research, 2026-) as the first entry.\n\n" +
                "INPUT:\n" +
                "1. TARGET JOB DESCRIPTION:\n" + jobDescription + "\n\n" +
                "2. CANDIDATE SNIPPETS:\n" + snippetsContext.toString() + "\n\n" +
                "REQUIRED STRUCTURE (Output ONLY this):\n\n" +
                "# [Name from Communication Snippet]\n" +
                "**Senior Software Architect | AI & Cloud-Native Engineering Leader**\n" +
                "**[Email] | [Phone] | [LinkedIn] | [Location]**\n\n" +
                "## PROFESSIONAL SUMMARY\n" +
                "[3-4 sentence high-impact summary tailored to JD keywords]\n\n" +
                "## CORE COMPETENCIES\n" +
                "- [Categorized skills aligned with JD requirements]\n\n" +
                "## PROFESSIONAL EXPERIENCE\n" +
                "### [Role Title] | [Company] | [Dates]\n" +
                "- [Contextual bullet point matching JD needs]\n" +
                "- **Impact:** [Quantitative result/ROI from snippet]\n" +
                "- **Tech:** [Tech stack used]\n\n" +
                "## EDUCATION \n" +
                "[Education details from snippets]\n\n" +
                "Markdown Style Rules:\n" +
                "- Use '###' for company/roles.\n" +
                "- Bold all impact metrics and key technical terms.\n" +
                "- Ensure consistent spacing and professional layout.\n\n" +
                "GENERATE TAILORED RESUME (Markdown):";

        settingsService.logActivity("BACKEND", "COMPOSITION", "INFO", "Generated tailored resume (Length: " + jobDescription.length() + ")", 
            jobDescription.substring(0, Math.min(jobDescription.length(), 50)) + "...");
        return aiService.callLLM(prompt, false);
    }
}
