package com.pao.repository;

import com.pao.model.RelationshipTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RelationshipTypeRepository extends JpaRepository<RelationshipTypeEntity, Long> {
    Optional<RelationshipTypeEntity> findByName(String name);
}
