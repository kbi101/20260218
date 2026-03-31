package com.pao.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.HashMap;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ScrapeService {

    private final AIService aiService;
    private final SystemSettingsService settingsService;

    @Autowired
    public ScrapeService(AIService aiService, SystemSettingsService settingsService) {
        this.aiService = aiService;
        this.settingsService = settingsService;
    }

    public Map<String, String> scrapeJob(String url) {
        Map<String, String> result = new java.util.HashMap<>();
        try {
            settingsService.logActivity("BACKEND", "SCRAPE", "INFO", "Starting web scrape for: " + url, "");

            Document doc;
            String effectiveUrl = url;

            // Specialized Workday handling: Workday is a SPA and Jsoup won't see the content.
            // We transform the URL to their internal CXS API.
            if (url.contains("workdayjobs.com") && url.contains("/job/")) {
                try {
                    // Pattern: https://tenant.wd1.myworkdayjobs.com/en-US/tenant2/job/id
                    // API: https://tenant.wd1.myworkdayjobs.com/wday/cxs/tenant/tenant2/job/id
                    java.util.regex.Matcher m = java.util.regex.Pattern.compile("https://([^.]+)\\.[^/]+/en-[A-Z]{2}/([^/]+)/job/(.+)").matcher(url);
                    if (m.find()) {
                        String tenant1 = m.group(1);
                        String tenant2 = m.group(2);
                        String jobId = m.group(3);
                        effectiveUrl = String.format("https://%s.wd1.myworkdayjobs.com/wday/cxs/%s/%s/job/%s", 
                                                    tenant1, tenant1, tenant2, jobId);
                    }
                } catch (Exception ex) {
                    // Fallback to original URL if regex fails
                }
            }

            doc = Jsoup.connect(effectiveUrl)
                    .userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .header("Accept", "application/json, text/plain, */*")
                    .timeout(20000)
                    .ignoreContentType(true)
                    .followRedirects(true)
                    .get();

            String title = doc.title();
            String rawText = doc.body().text();

            // Limiting raw text to avoid token limits in LLM
            if (rawText.length() > 20000) {
                rawText = rawText.substring(0, 20000);
            }

            String prompt = "You are an expert recruitment assistant. " +
                    "I will provide you with the raw text of a job posting scraped from a website. " +
                    "Your task is to extract the Job Title, Company/Organization Name, and create a professional Markdown job description. " +
                    "Return ONLY a JSON object with these keys: 'jobTitle', 'organizationName', 'markdownContent'. " +
                    "The 'markdownContent' value MUST be a single Markdown-formatted STRING (not an object), including headers for 'Role Overview', 'Key Responsibilities', and 'Requirements/Qualifications'. " +
                    "If a field cannot be found, set it to an empty string.\n\n" +
                    "URL TITLE: " + title + "\n" +
                    "SCRAPED RAW TEXT:\n" + rawText;

            String aiResponse = aiService.callLLM(prompt, false);

            if (aiResponse != null) {
                // Parse the JSON response from AI
                // Note: Using a simple regex to extract JSON if AI includes extra text
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\{.*\\}", java.util.regex.Pattern.DOTALL);
                java.util.regex.Matcher matcher = pattern.matcher(aiResponse);
                if (matcher.find()) {
                    String jsonStr = matcher.group();
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    return mapper.readValue(jsonStr, new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {});
                }
            }

            result.put("markdownContent", "⚠️ **Warning: Failed to parse job data from scraped content.**");
            return result;

        } catch (Exception e) {
            settingsService.logActivity("BACKEND", "SCRAPE", "ERROR", "Scraping/AI formatting failed for: " + url, e.getMessage());
            result.put("markdownContent", "Error while scraping job details: " + e.getMessage());
            return result;
        }
    }
}
