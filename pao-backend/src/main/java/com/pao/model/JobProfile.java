package com.pao.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_profiles")
public class JobProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String targetIndustry;
    private String workModel; // e.g. REMOTE, HYBRID, ONSITE
    private String jobType; // e.g. FULL_TIME, CONTRACT
    private String expectedSalary;

    @OneToMany(mappedBy = "jobProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<JobOpportunity> opportunities = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", referencedColumnName = "id")
    @JsonIgnore
    private Person person;

    public JobProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Person getPerson() { return person; }
    public void setPerson(Person person) { this.person = person; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTargetIndustry() { return targetIndustry; }
    public void setTargetIndustry(String targetIndustry) { this.targetIndustry = targetIndustry; }
    public String getWorkModel() { return workModel; }
    public void setWorkModel(String workModel) { this.workModel = workModel; }
    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }
    public String getExpectedSalary() { return expectedSalary; }
    public void setExpectedSalary(String expectedSalary) { this.expectedSalary = expectedSalary; }
    public List<JobOpportunity> getOpportunities() { return opportunities; }
    public void setOpportunities(List<JobOpportunity> opportunities) { this.opportunities = opportunities; }
}
