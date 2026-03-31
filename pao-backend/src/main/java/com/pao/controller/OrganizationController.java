package com.pao.controller;

import com.pao.model.Organization;
import com.pao.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final com.pao.service.OrganizationEnrichmentService enrichmentService;

    @Autowired
    public OrganizationController(OrganizationService organizationService,
            com.pao.service.OrganizationEnrichmentService enrichmentService) {
        this.organizationService = organizationService;
        this.enrichmentService = enrichmentService;
    }

    @GetMapping
    public List<Organization> getAllOrganizations() {
        return organizationService.getAllOrganizations();
    }

    @GetMapping("/roots")
    public List<Organization> getRootOrganizations() {
        return organizationService.getRootOrganizations();
    }

    @GetMapping("/{id}")
    public Organization getOrganization(@PathVariable Long id) {
        return organizationService.getOrganization(id);
    }

    @PostMapping
    public Organization createOrganization(@RequestBody Organization organization) {
        return organizationService.createOrganization(organization);
    }

    @PostMapping("/{parentId}/children")
    public Organization addChildOrganization(@PathVariable Long parentId, @RequestBody Organization child) {
        return organizationService.addChildOrganization(parentId, child);
    }

    @PutMapping("/{id}")
    public Organization updateOrganization(@PathVariable Long id, @RequestBody Organization organization) {
        return organizationService.updateOrganization(id, organization);
    }

    @DeleteMapping("/{id}")
    public void deleteOrganization(@PathVariable Long id) {
        organizationService.deleteOrganization(id);
    }

    @PostMapping("/{id}/enrich")
    public Organization enrichOrganization(@PathVariable Long id) {
        return enrichmentService.enrichOrganization(id);
    }
}
