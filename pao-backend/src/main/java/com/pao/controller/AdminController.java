package com.pao.controller;

import com.pao.model.SiteSetting;
import com.pao.model.TaskLog;
import com.pao.service.SystemSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final SystemSettingsService settingsService;

    @Autowired
    public AdminController(SystemSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping("/settings")
    public List<SiteSetting> getSettings() {
        return settingsService.getAllSettings();
    }

    @PostMapping("/settings")
    public void updateSetting(@RequestBody Map<String, String> update) {
        update.forEach(settingsService::updateSetting);
    }

    @GetMapping("/logs")
    public List<TaskLog> getLogs() {
        return settingsService.getRecentLogs();
    }

    @PostMapping("/logs")
    public void logFrontendEvent(@RequestBody TaskLog log) {
        settingsService.logActivity("FRONTEND", log.getCategory(), log.getLevel(), log.getMessage(), log.getDetails());
    }

    @DeleteMapping("/logs")
    public void clearLogs() {
        settingsService.clearLogs();
    }
}
