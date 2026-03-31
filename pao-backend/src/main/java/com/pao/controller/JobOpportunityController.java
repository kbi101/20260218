package com.pao.controller;

import com.pao.model.JobOpportunity;
import com.pao.service.JobOpportunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-opportunities")
public class JobOpportunityController {

    private final JobOpportunityService service;

    @Autowired
    public JobOpportunityController(JobOpportunityService service) {
        this.service = service;
    }

    @GetMapping
    public List<JobOpportunity> getAllJobOpportunities(@RequestParam(required = false) Long personId) {
        if (personId != null) {
            return service.getJobOpportunitiesByPerson(personId);
        }
        return service.getAllJobOpportunities();
    }

    @GetMapping("/profile/{profileId}")
    public List<JobOpportunity> getByProfile(@PathVariable Long profileId) {
        return service.getOpportunitiesByProfile(profileId);
    }

    @GetMapping("/organization/{orgId}")
    public List<JobOpportunity> getByOrganization(@PathVariable Long orgId) {
        return service.getOpportunitiesByOrganization(orgId);
    }

    @GetMapping("/{id}")
    public JobOpportunity getJobOpportunity(@PathVariable @NonNull Long id) {
        return service.getJobOpportunity(id);
    }

    @PostMapping
    public JobOpportunity createJobOpportunity(@RequestBody @NonNull JobOpportunity jobOpportunity) {
        return service.createJobOpportunity(jobOpportunity);
    }

    @PutMapping("/{id}")
    public JobOpportunity updateJobOpportunity(@PathVariable Long id, @RequestBody JobOpportunity jobOpportunity) {
        return service.updateJobOpportunity(id, jobOpportunity);
    }

    @DeleteMapping("/{id}")
    public void deleteJobOpportunity(@PathVariable @NonNull Long id) {
        service.deleteJobOpportunity(id);
    }
}
