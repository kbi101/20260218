package com.pao.repository;

import com.pao.model.Communication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunicationRepository extends JpaRepository<Communication, Long> {
    List<Communication> findByJobOpportunityIdOrderByDateDesc(Long jobOpportunityId);
}
