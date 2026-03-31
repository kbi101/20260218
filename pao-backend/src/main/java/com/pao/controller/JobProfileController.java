package com.pao.controller;

import com.pao.model.JobProfile;
import com.pao.model.Person;
import com.pao.repository.PersonRepository;
import com.pao.service.JobProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-profiles")
public class JobProfileController {

    private final JobProfileService service;
    private final PersonRepository personRepository;

    @Autowired
    public JobProfileController(JobProfileService service, PersonRepository personRepository) {
        this.service = service;
        this.personRepository = personRepository;
    }

    @GetMapping
    public List<JobProfile> getAllJobProfiles(@RequestParam(required = false) Long personId) {
        if (personId != null) {
            return service.getJobProfilesByPerson(personId);
        }
        return service.getAllJobProfiles();
    }

    @GetMapping("/{id}")
    public JobProfile getJobProfile(@PathVariable @NonNull Long id) {
        return service.getJobProfile(id);
    }

    @PostMapping
    public JobProfile createJobProfile(@RequestBody @NonNull JobProfile jobProfile, @RequestParam(required = false) Long personId) {
        if (personId != null) {
            Person person = personRepository.findById(personId)
                    .orElseThrow(() -> new RuntimeException("Person not found"));
            jobProfile.setPerson(person);
        }
        return service.createJobProfile(jobProfile);
    }

    @PutMapping("/{id}")
    public JobProfile updateJobProfile(@PathVariable Long id, @RequestBody JobProfile jobProfile) {
        return service.updateJobProfile(id, jobProfile);
    }

    @DeleteMapping("/{id}")
    public void deleteJobProfile(@PathVariable @NonNull Long id) {
        service.deleteJobProfile(id);
    }
}
