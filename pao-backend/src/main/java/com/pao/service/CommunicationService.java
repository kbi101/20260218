package com.pao.service;

import com.pao.model.Communication;
import com.pao.model.JobOpportunity;
import com.pao.repository.CommunicationRepository;
import com.pao.repository.JobOpportunityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommunicationService {

    private final CommunicationRepository repository;
    private final JobOpportunityRepository jobOppRepository;
    private final ExternalIntegrationService externalService;

    @Autowired
    public CommunicationService(CommunicationRepository repository, JobOpportunityRepository jobOppRepository,
            ExternalIntegrationService externalService) {
        this.repository = repository;
        this.jobOppRepository = jobOppRepository;
        this.externalService = externalService;
    }

    public List<Communication> getCommunicationsForOpportunity(Long opportunityId) {
        return repository.findByJobOpportunityIdOrderByDateDesc(opportunityId);
    }

    public Communication getCommunication(@NonNull Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Communication not found"));
    }

    public Communication createCommunication(@NonNull Communication communication) {
        return repository.save(communication);
    }

    public Communication updateCommunication(Long id, Communication details) {
        Communication existing = getCommunication(id);
        existing.setDate(details.getDate());
        existing.setType(details.getType());
        existing.setSubject(details.getSubject());
        existing.setBody(details.getBody());
        existing.setFromAddress(details.getFromAddress());
        existing.setToAddress(details.getToAddress());
        existing.setLocalDocUrl(details.getLocalDocUrl());
        return repository.save(existing);
    }

    public void deleteCommunication(@NonNull Long id) {
        repository.deleteById(id);
    }

    public List<Communication> importFromGmail(Long opportunityId) {
        JobOpportunity opp = jobOppRepository.findById(opportunityId)
                .orElseThrow(() -> new RuntimeException("Opportunity not found"));
        List<Communication> newComms = externalService.mockImportFromGmail(opp);
        return repository.saveAll(newComms);
    }
}
