package com.pao.service;

import com.pao.model.SiteSetting;
import com.pao.model.TaskLog;
import com.pao.repository.SiteSettingRepository;
import com.pao.repository.TaskLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SystemSettingsService {

    private final SiteSettingRepository settingRepository;
    private final TaskLogRepository logRepository;

    @Value("${app.ai.mcp.url:http://localhost:3013}")
    private String defaultMcpUrl;

    @Value("${app.ai.ollama.url:http://localhost:11434}")
    private String defaultOllamaUrl;

    @Value("${app.ai.ollama.model:qwen3.5:35b}")
    private String defaultOllamaModel;

    @Value("${app.ai.prefer-local:false}")
    private String defaultPreferLocal;

    @Value("${app.ai.gemini.key:REPLACE_ME}")
    private String defaultGeminiKey;

    @Value("${app.ai.gemini.model:gemini-3.0-flash}")
    private String defaultGeminiModel;

    @Autowired
    public SystemSettingsService(SiteSettingRepository settingRepository, TaskLogRepository logRepository) {
        this.settingRepository = settingRepository;
        this.logRepository = logRepository;
        initializeDefaults();
    }

    private void initializeDefaults() {
        String[][] config = {
            {"mcp_url", defaultMcpUrl, "The MCP server URL for tool calling."},
            {"ollama_url", defaultOllamaUrl, "The local Ollama server address."},
            {"ollama_model", defaultOllamaModel, "The local model name for Ollama fallbacks."},
            {"prefer_local_llm", defaultPreferLocal, "Whether to prioritize Ollama over Gemini (true/false)."},
            {"gemini_key", defaultGeminiKey, "The Google Gemini API Key."},
            {"default_model", defaultGeminiModel, "The default AI model to prioritize."}
        };
        for (String[] def : config) {
            SiteSetting existing = settingRepository.findById(def[0]).orElse(null);
            if (existing == null) {
                settingRepository.save(new SiteSetting(def[0], def[1], def[2]));
            } else if ("REPLACE_ME".equals(existing.getValue()) || existing.getValue() == null || existing.getValue().isEmpty()) {
                // If the DB has a default/empty value, but the app has a real environment value, override it.
                if (!"REPLACE_ME".equals(def[1]) && def[1] != null && !def[1].isEmpty()) {
                    existing.setValue(def[1]);
                    settingRepository.save(existing);
                    System.out.println("LOG [INFO] INITIALIZATION: Overriding default '" + def[0] + "' with environment value.");
                }
            }
        }
        
        // Specific environment override logic (Docker, etc)
        String envMcp = System.getenv("MCP_URL");
        if (envMcp != null && !envMcp.isEmpty()) updateSetting("mcp_url", envMcp);
        
        String envGemini = System.getenv("GEMINI_KEY");
        if (envGemini != null && !envGemini.isEmpty()) updateSetting("gemini_key", envGemini);

        String envOllama = System.getenv("OLLAMA_URL");
        if (envOllama != null && !envOllama.isEmpty()) updateSetting("ollama_url", envOllama);

        String envOllamaModel = System.getenv("OLLAMA_MODEL");
        if (envOllamaModel != null && !envOllamaModel.isEmpty()) updateSetting("ollama_model", envOllamaModel);
    }

    public List<SiteSetting> getAllSettings() {
        return settingRepository.findAll();
    }

    public String getSetting(String key, String defaultValue) {
        return settingRepository.findById(key).map(SiteSetting::getValue).orElse(defaultValue);
    }

    public void updateSetting(String key, String value) {
        SiteSetting s = settingRepository.findById(key).orElse(new SiteSetting(key, value, "User Setting"));
        s.setValue(value);
        settingRepository.save(s);
        logActivity("BACKEND", "SETTING_UPDATE", "INFO", "Setting updated: " + key, "Value changed to: " + value);
    }

    public void logActivity(String source, String category, String level, String message, String details) {
        System.out.println("LOG [" + level + "] " + category + ": " + message);
        logRepository.save(new TaskLog(source, category, level, message, details));
    }

    public List<TaskLog> getRecentLogs() {
        return logRepository.findAllByOrderByTimestampDesc();
    }

    public void clearLogs() {
        logRepository.deleteAll();
    }
}
