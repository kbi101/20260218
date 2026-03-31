package com.pao.service;

import com.pao.exception.QuotaExceededException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIService {

    private final SystemSettingsService settingsService;
    private final RestTemplate restTemplate;

    @Autowired
    public AIService(SystemSettingsService settingsService, RestTemplate restTemplate) {
        this.settingsService = settingsService;
        this.restTemplate = restTemplate;
    }

    public String callLLM(String prompt, boolean forceJson) throws Exception {
        boolean preferLocal = "true".equalsIgnoreCase(settingsService.getSetting("prefer_local_llm", "false"));
        if (preferLocal) {
            try {
                return callLocalOllama(prompt, forceJson);
            } catch (Exception e) {
                settingsService.logActivity("BACKEND", "LLM_FALLBACK", "WARN", "Local AI failed, trying cloud fallback...", e.getMessage());
                try {
                    return callCloudGemini(prompt);
                } catch (QuotaExceededException quotaEx) {
                    throw quotaEx;
                } catch (Exception cloudError) {
                    throw new Exception("All AI services failed. Local: " + e.getMessage() + " | Cloud: " + cloudError.getMessage());
                }
            }
        } else {
            try {
                return callCloudGemini(prompt);
            } catch (QuotaExceededException quotaEx) {
                throw quotaEx;
            } catch (Exception e) {
                settingsService.logActivity("BACKEND", "LLM_FALLBACK", "WARN", "Cloud AI failed (likely quota limit), trying local fallback...", e.getMessage());
                try {
                    return callLocalOllama(prompt, forceJson);
                } catch (Exception ollamaError) {
                    throw new Exception("All AI services failed. Cloud: " + e.getMessage() + " | Local: " + ollamaError.getMessage());
                }
            }
        }
    }

    public String callCloudGemini(String prompt) throws Exception {
        String geminiKey = settingsService.getSetting("gemini_key", "");
        String model = settingsService.getSetting("default_model", "gemini-2.5-flash");
        String geminiUrl = "https://generativelanguage.googleapis.com/v1/models/" + model + ":generateContent?key=" + geminiKey;
        
        if (geminiKey.isEmpty() || geminiKey.equals("REPLACE_ME")) throw new Exception("Gemini key missing");
        
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        Map<String, Object> content = new HashMap<>();
        content.put("parts", java.util.Collections.singletonList(part));
        Map<String, Object> body = new HashMap<>();
        body.put("contents", java.util.Collections.singletonList(content));

        @SuppressWarnings("unchecked")
        Map<String, Object> response;
        try {
            response = restTemplate.postForObject(geminiUrl, body, Map.class);
        } catch (HttpClientErrorException.TooManyRequests e) {
            throw new QuotaExceededException("Google Gemini quota exceeded.", prompt);
        } catch (Exception e) {
            throw new Exception("Gemini API error: " + e.getMessage());
        }
        if (response != null && response.containsKey("candidates")) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (!candidates.isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> firstCandidate = candidates.get(0);
                @SuppressWarnings("unchecked")
                Map<String, Object> contentMap = (Map<String, Object>) firstCandidate.get("content");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
                return (String) parts.get(0).get("text");
            }
        }
        throw new Exception("Empty Gemini response");
    }

    public String callLocalOllama(String prompt, boolean forceJson) throws Exception {
        String ollamaUrl = settingsService.getSetting("ollama_url", "http://host.docker.internal:11434");
        String ollamaModel = settingsService.getSetting("ollama_model", "qwen3.5:35b");
        Map<String, Object> body = new HashMap<>();
        body.put("model", ollamaModel);
        body.put("prompt", prompt);
        body.put("stream", false);
        // Removed forceJson to avoid Ollama strict schema errors on complex prompts.
        // cleanJson will handle extracting the JSON block from the response.

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(ollamaUrl + "/api/generate", body, Map.class);
        if (response != null && response.containsKey("response")) return (String) response.get("response");
        throw new Exception("Ollama yielded no response");
    }

    public String cleanJson(String output) {
        if (output == null) return null;
        int start = output.indexOf('{');
        int end = output.lastIndexOf('}');
        
        // Check if there's an array instead of or around the object
        int arrayStart = output.indexOf('[');
        int arrayEnd = output.lastIndexOf(']');
        
        if (arrayStart != -1 && (start == -1 || arrayStart < start)) {
            start = arrayStart;
            end = arrayEnd;
        }

        if (start != -1 && end != -1 && end > start) return output.substring(start, end + 1);
        return output.trim();
    }
}
