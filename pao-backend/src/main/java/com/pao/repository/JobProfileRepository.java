package com.pao.repository;

import com.pao.model.JobProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobProfileRepository extends JpaRepository<JobProfile, Long> {
    List<JobProfile> findByPersonId(Long personId);
}
