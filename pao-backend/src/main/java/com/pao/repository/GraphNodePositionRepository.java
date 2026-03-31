package com.pao.repository;

import com.pao.model.GraphNodePosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GraphNodePositionRepository extends JpaRepository<GraphNodePosition, String> {
}
