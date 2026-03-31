package com.pao.controller;

import com.pao.model.Communication;
import com.pao.service.CommunicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communications")
public class CommunicationController {

    private final CommunicationService service;

    @Autowired
    public CommunicationController(CommunicationService service) {
        this.service = service;
    }

    @GetMapping("/opportunity/{opportunityId}")
    public List<Communication> getCommunicationsForOpportunity(@PathVariable Long opportunityId) {
        return service.getCommunicationsForOpportunity(opportunityId);
    }

    @GetMapping("/{id}")
    public Communication getCommunication(@PathVariable @NonNull Long id) {
        return service.getCommunication(id);
    }

    @PostMapping
    public Communication createCommunication(@RequestBody @NonNull Communication communication) {
        return service.createCommunication(communication);
    }

    @PutMapping("/{id}")
    public Communication updateCommunication(@PathVariable Long id, @RequestBody Communication communication) {
        return service.updateCommunication(id, communication);
    }

    @DeleteMapping("/{id}")
    public void deleteCommunication(@PathVariable @NonNull Long id) {
        service.deleteCommunication(id);
    }

    @PostMapping("/import-gmail/{opportunityId}")
    public List<Communication> importFromGmail(@PathVariable @NonNull Long opportunityId) {
        return service.importFromGmail(opportunityId);
    }
}
