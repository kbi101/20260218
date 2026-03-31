package com.pao.service;

import com.pao.model.JobProfile;
import com.pao.repository.JobProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobProfileService {

    private final JobProfileRepository repository;

    @Autowired
    public JobProfileService(JobProfileRepository repository) {
        this.repository = repository;
    }

    public List<JobProfile> getAllJobProfiles() {
        return repository.findAll();
    }

    public List<JobProfile> getJobProfilesByPerson(Long personId) {
        return repository.findByPersonId(personId);
    }

    public JobProfile getJobProfile(@NonNull Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Job Profile not found"));
    }

    public JobProfile createJobProfile(@NonNull JobProfile jobProfile) {
        return repository.save(jobProfile);
    }

    public JobProfile updateJobProfile(Long id, JobProfile jobProfileDetails) {
        JobProfile existing = getJobProfile(id);
        existing.setTitle(jobProfileDetails.getTitle());
        existing.setDescription(jobProfileDetails.getDescription());
        existing.setTargetIndustry(jobProfileDetails.getTargetIndustry());
        existing.setWorkModel(jobProfileDetails.getWorkModel());
        existing.setJobType(jobProfileDetails.getJobType());
        existing.setExpectedSalary(jobProfileDetails.getExpectedSalary());
        return repository.save(existing);
    }

    public void deleteJobProfile(@NonNull Long id) {
        repository.deleteById(id);
    }
}
