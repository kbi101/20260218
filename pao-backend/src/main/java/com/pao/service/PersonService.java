package com.pao.service;

import com.pao.model.Organization;
import com.pao.model.Person;
import com.pao.model.Relationship;
import com.pao.model.JobOpportunity;
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
public class PersonService {

    private final PersonRepository personRepository;
    private final RelationshipRepository relationshipRepository;
    private final OrganizationRepository organizationRepository;
    private final JobOpportunityRepository jobOpportunityRepository;

    @Autowired
    public PersonService(PersonRepository personRepository, RelationshipRepository relationshipRepository,
            OrganizationRepository organizationRepository, JobOpportunityRepository jobOpportunityRepository) {
        this.personRepository = personRepository;
        this.relationshipRepository = relationshipRepository;
        this.organizationRepository = organizationRepository;
        this.jobOpportunityRepository = jobOpportunityRepository;
    }

    public List<Person> getAllPeople() {
        return personRepository.findAll();
    }

    public Person getPerson(Long id) {
        if (id == null)
            throw new IllegalArgumentException("Id cannot be null");
        return personRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Person not found with id: " + id));
    }

    public Person createPerson(Person person) {
        if (person.getOrganizations() != null && !person.getOrganizations().isEmpty()) {
            List<Organization> managedOrgs = new ArrayList<>();
            for (Organization org : person.getOrganizations()) {
                Long orgId = org.getId();
                if (orgId != null) {
                    organizationRepository.findById(orgId).ifPresent(managedOrgs::add);
                }
            }
            person.setOrganizations(managedOrgs);
        }
        return personRepository.save(person);
    }

    public Person updatePerson(Long id, Person personDetails) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Person not found with id: " + id));

        person.setFirstName(personDetails.getFirstName());
        person.setLastName(personDetails.getLastName());
        person.setAge(personDetails.getAge());
        person.setJob(personDetails.getJob());
        person.setDescription(personDetails.getDescription());
        person.setAddress(personDetails.getAddress());

        person.setEmail(personDetails.getEmail());
        person.setWebsite(personDetails.getWebsite());
        person.setPhones(personDetails.getPhones());
        person.setSocialLinks(personDetails.getSocialLinks());
        person.setPrimary(personDetails.isPrimary());

        if (personDetails.getOrganizations() != null) {
            List<Organization> managedOrgs = new ArrayList<>();
            for (Organization org : personDetails.getOrganizations()) {
                Long orgId = org.getId();
                if (orgId != null) {
                    organizationRepository.findById(orgId).ifPresent(managedOrgs::add);
                }
            }
            person.setOrganizations(managedOrgs);
        } else {
            person.getOrganizations().clear();
        }

        return personRepository.save(person);
    }

    @Transactional
    public void deletePerson(Long id) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Person not found with id: " + id));

        // Clean up JobOpportunity contacts
        if (person.getJobOpportunities() != null) {
            for (JobOpportunity job : person.getJobOpportunities()) {
                job.getContacts().remove(person);
                jobOpportunityRepository.save(job);
            }
        }

        // Clean up relationships manually just in case
        List<Relationship> relationships = relationshipRepository.findAllInvolvingEntity(id);
        relationshipRepository.deleteAll(relationships);

        personRepository.delete(person);
    }

    public List<Person> searchPeople(String query) {
        return personRepository.searchByName(query);
    }

}
