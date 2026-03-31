package com.pao.controller;

import com.pao.model.AppSetting;
import com.pao.repository.AppSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class AppSettingController {

    @Autowired
    private AppSettingRepository repository;

    @GetMapping("/{key}")
    public ResponseEntity<AppSetting> getSetting(@PathVariable String key) {
        return repository.findById(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public AppSetting saveSetting(@RequestBody AppSetting setting) {
        return repository.save(setting);
    }
}
