package com.pao.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "persons")
public class Person {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private int age;
    private String job;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String address;
    private String email;
    private String website;
    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary = false;

    @OneToMany(mappedBy = "person", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ElevatorPitch> elevatorPitches = new ArrayList<>();

    @OneToMany(mappedBy = "person", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Resume> resumes = new ArrayList<>();

    @OneToMany(mappedBy = "person", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ResumeSnippet> resumeSnippets = new ArrayList<>();

    @OneToMany(mappedBy = "sourcePerson", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Relationship> sourceRelationships = new ArrayList<>();

    @OneToMany(mappedBy = "targetPerson", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Relationship> targetRelationships = new ArrayList<>();

    @ManyToMany(mappedBy = "contacts")
    @JsonIgnore
    private List<JobOpportunity> jobOpportunities = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "person_phones", joinColumns = @JoinColumn(name = "person_id"))
    @Column(name = "phone_number")
    private List<String> phones = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "person_social_links", joinColumns = @JoinColumn(name = "person_id"))
    @MapKeyColumn(name = "platform")
    @Column(name = "social_id")
    private Map<String, String> socialLinks = new HashMap<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "person_organizations", joinColumns = @JoinColumn(name = "person_id"), inverseJoinColumns = @JoinColumn(name = "organization_id"))
    private List<Organization> organizations = new ArrayList<>();

    public Person() {}

    public Person(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public String getJob() { return job; }
    public void setJob(String job) { this.job = job; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public boolean isPrimary() { return isPrimary; }
    public void setPrimary(boolean primary) { isPrimary = primary; }
    public List<ElevatorPitch> getElevatorPitches() { return elevatorPitches; }
    public void setElevatorPitches(List<ElevatorPitch> elevatorPitches) { this.elevatorPitches = elevatorPitches; }
    public List<Resume> getResumes() { return resumes; }
    public void setResumes(List<Resume> resumes) { this.resumes = resumes; }
    public List<ResumeSnippet> getResumeSnippets() { return resumeSnippets; }
    public void setResumeSnippets(List<ResumeSnippet> resumeSnippets) { this.resumeSnippets = resumeSnippets; }
    public List<Relationship> getSourceRelationships() { return sourceRelationships; }
    public void setSourceRelationships(List<Relationship> sourceRelationships) { this.sourceRelationships = sourceRelationships; }
    public List<Relationship> getTargetRelationships() { return targetRelationships; }
    public void setTargetRelationships(List<Relationship> targetRelationships) { this.targetRelationships = targetRelationships; }
    public List<JobOpportunity> getJobOpportunities() { return jobOpportunities; }
    public void setJobOpportunities(List<JobOpportunity> jobOpportunities) { this.jobOpportunities = jobOpportunities; }
    public List<String> getPhones() { return phones; }
    public void setPhones(List<String> phones) { this.phones = phones; }
    public Map<String, String> getSocialLinks() { return socialLinks; }
    public void setSocialLinks(Map<String, String> socialLinks) { this.socialLinks = socialLinks; }
    public List<Organization> getOrganizations() { return organizations; }
    public void setOrganizations(List<Organization> organizations) { this.organizations = organizations; }
}
