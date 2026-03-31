package com.pao.service;

import com.pao.model.Organization;
import com.pao.model.Person;
import com.pao.repository.JobOpportunityRepository;
import com.pao.repository.OrganizationRepository;
import com.pao.repository.PersonRepository;
import com.pao.repository.RelationshipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final PersonRepository personRepository;
    private final RelationshipRepository relationshipRepository;
    private final JobOpportunityRepository jobOpportunityRepository;

    @Autowired
    public OrganizationService(OrganizationRepository organizationRepository, PersonRepository personRepository,
            RelationshipRepository relationshipRepository, JobOpportunityRepository jobOpportunityRepository) {
        this.organizationRepository = organizationRepository;
        this.personRepository = personRepository;
        this.relationshipRepository = relationshipRepository;
        this.jobOpportunityRepository = jobOpportunityRepository;
    }

    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    public List<Organization> getRootOrganizations() {
        return organizationRepository.findByParentIsNull();
    }

    public Organization createOrganization(Organization organization) {
        return organizationRepository.save(organization);
    }

    @Transactional
    public Organization addChildOrganization(Long parentId, Organization child) {
        Organization parent = getOrganization(parentId);

        // Prevent cycles
        if (isAncestor(child.getId(), parent)) {
            throw new IllegalArgumentException("Cannot add child that would create a cycle in hierarchy");
        }

        child.setParent(parent);
        parent.getChildren().add(child);

        return organizationRepository.save(child);
    }

    private boolean isAncestor(Long potentialChildId, Organization potentialParent) {
        if (potentialChildId == null)
            return false;
        Organization current = potentialParent;
        while (current != null) {
            if (potentialChildId.equals(current.getId())) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }

    public Organization getOrganization(Long id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));
    }

    @Transactional
    public Organization updateOrganization(Long id, Organization details) {
        Organization org = getOrganization(id);
        org.setName(details.getName());
        org.setAddress(details.getAddress());
        org.setType(details.getType());
        org.setWebsite(details.getWebsite());
        org.setEmail(details.getEmail());
        org.setPhone(details.getPhone());
        org.setProfileMd(details.getProfileMd());

        // Handle parent update
        if (details.getParent() != null && details.getParent().getId() != null) {
            Long newParentId = details.getParent().getId();
            if (newParentId.equals(id)) {
                throw new IllegalArgumentException("Organization cannot be its own parent");
            }
            Organization newParent = getOrganization(newParentId);

            // Prevent cycles
            if (isAncestor(id, newParent)) {
                throw new IllegalArgumentException("Cannot set parent that would create a cycle");
            }

            org.setParent(newParent);
        } else {
            org.setParent(null);
        }

        return organizationRepository.save(org);
    }

    @Transactional
    public void deleteOrganization(Long id) {
        Organization org = getOrganization(id);

        // Delete any relationships involving this organization to avert foreign key
        // constraint errors
        List<com.pao.model.Relationship> relatedRelationships = relationshipRepository
                .findBySourceOrganizationIdOrTargetOrganizationId(id, id);
        relationshipRepository.deleteAll(relatedRelationships);

        // Delete any associated job opportunities
        List<com.pao.model.JobOpportunity> jobOpportunities = jobOpportunityRepository.findByOrganizationId(id);
        jobOpportunityRepository.deleteAll(jobOpportunities);

        // Remove links from People (Many-to-Many)
        List<Person> people = personRepository.findByOrganizationId(id);
        for (Person p : people) {
            p.getOrganizations().remove(org);
            personRepository.save(p);
        }

        // Handle children: Promote them to root organizations
        // Create a copy to avoid ConcurrentModificationException or focus issues
        List<Organization> childrenToUpdate = new ArrayList<>(org.getChildren());
        for (Organization child : childrenToUpdate) {
            child.setParent(null);
            organizationRepository.save(child);
        }

        // Clear children from parent locally just in case
        org.getChildren().clear();

        organizationRepository.delete(org);
    }
}
