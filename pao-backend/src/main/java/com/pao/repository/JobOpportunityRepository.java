package com.pao.repository;

import com.pao.model.JobOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobOpportunityRepository extends JpaRepository<JobOpportunity, Long> {
    List<JobOpportunity> findByJobProfileId(Long jobProfileId);

    List<JobOpportunity> findByOrganizationId(Long organizationId);
    List<JobOpportunity> findByJobProfilePersonId(Long personId);
}
