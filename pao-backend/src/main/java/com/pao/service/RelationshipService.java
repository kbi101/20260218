package com.pao.service;

import com.pao.model.Relationship;
import com.pao.repository.OrganizationRepository;
import com.pao.repository.PersonRepository;
import com.pao.repository.RelationshipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RelationshipService {

    private final RelationshipRepository relationshipRepository;
    private final PersonRepository personRepository;
    private final OrganizationRepository organizationRepository;

    @Autowired
    public RelationshipService(RelationshipRepository relationshipRepository, PersonRepository personRepository,
            OrganizationRepository organizationRepository) {
        this.relationshipRepository = relationshipRepository;
        this.personRepository = personRepository;
        this.organizationRepository = organizationRepository;
    }

    public List<Relationship> getRelationshipsForPerson(Long personId) {
        return relationshipRepository.findBySourcePersonIdOrTargetPersonId(personId, personId);
    }

    public List<Relationship> getRelationshipsForOrganization(Long orgId) {
        return relationshipRepository.findBySourceOrganizationIdOrTargetOrganizationId(orgId, orgId);
    }

    public List<Relationship> getAllRelationships() {
        return relationshipRepository.findAll();
    }

    @Transactional
    public Relationship addRelationship(Long sourceId, Long targetId, String sourceType, String targetType,
            String type) {
        Relationship relationship = new Relationship();
        relationship.setType(type);

        if ("PERSON".equalsIgnoreCase(sourceType)) {
            relationship.setSourcePerson(personRepository.findById(sourceId)
                    .orElseThrow(() -> new RuntimeException("Source person not found")));
        } else if ("ORGANIZATION".equalsIgnoreCase(sourceType)) {
            relationship.setSourceOrganization(organizationRepository.findById(sourceId)
                    .orElseThrow(() -> new RuntimeException("Source organization not found")));
        }

        if ("PERSON".equalsIgnoreCase(targetType)) {
            relationship.setTargetPerson(personRepository.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("Target person not found")));
        } else if ("ORGANIZATION".equalsIgnoreCase(targetType)) {
            relationship.setTargetOrganization(organizationRepository.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("Target organization not found")));
        }

        // Special Rule: Removed. Allowing multiple relationships per person.
        // Previously: A Person could only be a MEMBER_OF one Organization at a time.

        // Check for existing identical relationship
        boolean exists = false;
        if (relationship.getSourcePerson() != null && relationship.getTargetPerson() != null) {
            exists = !relationshipRepository.findBySourcePersonAndTargetPersonAndType(relationship.getSourcePerson(),
                    relationship.getTargetPerson(), type).isEmpty();
        } else if (relationship.getSourceOrganization() != null && relationship.getTargetOrganization() != null) {
            exists = !relationshipRepository.findBySourceOrganizationAndTargetOrganizationAndType(
                    relationship.getSourceOrganization(), relationship.getTargetOrganization(), type).isEmpty();
        } else if (relationship.getSourcePerson() != null && relationship.getTargetOrganization() != null) {
            exists = !relationshipRepository.findBySourcePersonAndTargetOrganizationAndType(
                    relationship.getSourcePerson(), relationship.getTargetOrganization(), type).isEmpty();
        } else if (relationship.getSourceOrganization() != null && relationship.getTargetPerson() != null) {
            exists = !relationshipRepository.findBySourceOrganizationAndTargetPersonAndType(
                    relationship.getSourceOrganization(), relationship.getTargetPerson(), type).isEmpty();
        }

        if (exists) {
            throw new RuntimeException("Relationship already exists");
        }

        return relationshipRepository.save(relationship);
    }

    public void deleteRelationship(Long id) {
        relationshipRepository.deleteById(id);
    }
}
