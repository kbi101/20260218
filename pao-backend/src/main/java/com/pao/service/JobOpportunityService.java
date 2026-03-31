package com.pao.service;

import com.pao.model.JobOpportunity;
import com.pao.repository.JobOpportunityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobOpportunityService {

    private final JobOpportunityRepository repository;
    private final com.pao.repository.PersonRepository personRepository;

    @Autowired
    public JobOpportunityService(JobOpportunityRepository repository,
            com.pao.repository.PersonRepository personRepository) {
        this.repository = repository;
        this.personRepository = personRepository;
    }

    public List<JobOpportunity> getAllJobOpportunities() {
        return repository.findAll();
    }

    public List<JobOpportunity> getJobOpportunitiesByPerson(Long personId) {
        return repository.findByJobProfilePersonId(personId);
    }

    public List<JobOpportunity> getOpportunitiesByProfile(Long profileId) {
        return repository.findByJobProfileId(profileId);
    }

    public List<JobOpportunity> getOpportunitiesByOrganization(Long orgId) {
        return repository.findByOrganizationId(orgId);
    }

    public JobOpportunity getJobOpportunity(@NonNull Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Job Opportunity not found"));
    }

    public JobOpportunity createJobOpportunity(@NonNull JobOpportunity jobOpportunity) {
        processContacts(jobOpportunity);
        return repository.save(jobOpportunity);
    }

    public JobOpportunity updateJobOpportunity(Long id, JobOpportunity details) {
        JobOpportunity existing = getJobOpportunity(id);
        if (details.getOrganization() != null) {
            existing.setOrganization(details.getOrganization());
        }
        existing.setJobTitle(details.getJobTitle());
        existing.setStatus(details.getStatus());
        existing.setJobPostingUrl(details.getJobPostingUrl());
        existing.setApplicationLoginUrl(details.getApplicationLoginUrl());
        existing.setApplicationLoginInfo(details.getApplicationLoginInfo());
        existing.setNotes(details.getNotes());
        existing.setApplicationDate(details.getApplicationDate());
        existing.setPreparationNote(details.getPreparationNote());
        existing.setJobRequirements(details.getJobRequirements());

        existing.setContacts(details.getContacts());
        processContacts(existing);

        return repository.save(existing);
    }

    private void processContacts(JobOpportunity jobOpportunity) {
        if (jobOpportunity.getContacts() != null) {
            for (int i = 0; i < jobOpportunity.getContacts().size(); i++) {
                com.pao.model.Person contact = jobOpportunity.getContacts().get(i);
                if (contact.getId() == null) {
                    // New person, auto-create
                    contact = personRepository.save(contact);
                    jobOpportunity.getContacts().set(i, contact);
                }
            }
        }
    }

    public void deleteJobOpportunity(@NonNull Long id) {
        repository.deleteById(id);
    }
}
