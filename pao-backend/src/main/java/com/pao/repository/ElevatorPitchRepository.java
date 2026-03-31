package com.pao.repository;

import com.pao.model.ElevatorPitch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ElevatorPitchRepository extends JpaRepository<ElevatorPitch, Long> {
    List<ElevatorPitch> findByPersonId(Long personId);
}
