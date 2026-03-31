package com.pao.repository;

import com.pao.model.Relationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RelationshipRepository extends JpaRepository<Relationship, Long> {
        List<Relationship> findBySourcePersonIdOrTargetPersonId(Long sourceId, Long targetId);

        List<Relationship> findBySourceOrganizationIdOrTargetOrganizationId(Long sourceId, Long targetId);

        @org.springframework.data.jpa.repository.Query("SELECT r FROM Relationship r WHERE " +
                        "(:id IS NULL) OR " +
                        "(r.sourcePerson IS NOT NULL AND r.sourcePerson.id = :id) OR " +
                        "(r.targetPerson IS NOT NULL AND r.targetPerson.id = :id) OR " +
                        "(r.sourceOrganization IS NOT NULL AND r.sourceOrganization.id = :id) OR " +
                        "(r.targetOrganization IS NOT NULL AND r.targetOrganization.id = :id)")
        List<Relationship> findAllInvolvingEntity(Long id);

        List<Relationship> findBySourcePersonAndTargetPersonAndType(com.pao.model.Person source,
                        com.pao.model.Person target, String type);

        List<Relationship> findBySourceOrganizationAndTargetOrganizationAndType(com.pao.model.Organization source,
                        com.pao.model.Organization target, String type);

        List<Relationship> findBySourcePersonAndTargetOrganizationAndType(com.pao.model.Person source,
                        com.pao.model.Organization target, String type);

        List<Relationship> findBySourceOrganizationAndTargetPersonAndType(com.pao.model.Organization source,
                        com.pao.model.Person target, String type);
}
