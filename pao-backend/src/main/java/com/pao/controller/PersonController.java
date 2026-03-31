package com.pao.controller;

import com.pao.model.Person;
import com.pao.service.PersonEnrichmentService;
import com.pao.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/people")
public class PersonController {

    private final PersonService personService;
    private final PersonEnrichmentService enrichmentService;

    @Autowired
    public PersonController(PersonService personService, PersonEnrichmentService enrichmentService) {
        this.personService = personService;
        this.enrichmentService = enrichmentService;
    }

    @GetMapping
    public List<Person> getAllPeople() {
        return personService.getAllPeople();
    }

    @GetMapping("/search")
    public List<Person> searchPeople(@RequestParam String query) {
        return personService.searchPeople(query);
    }

    @GetMapping("/primary")
    public Person getPrimaryPerson() {
        return personService.getAllPeople().stream()
                .filter(Person::isPrimary)
                .findFirst()
                .orElse(null);
    }

    @PostMapping("/{id}/primary")
    public Person setPrimaryPerson(@PathVariable Long id) {
        List<Person> all = personService.getAllPeople();
        Person target = null;
        for (Person p : all) {
            if (p.getId().equals(id)) {
                p.setPrimary(true);
                target = personService.updatePerson(p.getId(), p);
            } else if (p.isPrimary()) {
                p.setPrimary(false);
                personService.updatePerson(p.getId(), p);
            }
        }
        return target;
    }

    @PostMapping("/{id}/enrich")
    public Person enrichPerson(@PathVariable Long id) {
        return enrichmentService.enrichPerson(id);
    }

    @PostMapping("/{id}/match-organization")
    public Person matchOrganization(@PathVariable Long id) {
        return enrichmentService.matchOrganization(id);
    }

    @PostMapping
    public Person createPerson(@RequestBody Person person) {
        return personService.createPerson(person);
    }

    @PutMapping("/{id}")
    public Person updatePerson(@PathVariable Long id, @RequestBody Person personDetails) {
        return personService.updatePerson(id, personDetails);
    }

    @DeleteMapping("/{id}")
    public void deletePerson(@PathVariable Long id) {
        personService.deletePerson(id);
    }
}
