package com.pao.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_opportunities")
public class JobOpportunity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "job_profile_id", nullable = false)
    private JobProfile jobProfile;

    @ManyToOne(optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    private String jobTitle; // Specific title at this company, might differ from profile

    private String status; // TARGET, APPLIED, INTERVIEWING, OFFERED, REJECTED

    private String jobPostingUrl;

    private String applicationLoginUrl;
    
    private String applicationLoginInfo;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDate applicationDate;

    @Column(columnDefinition = "TEXT")
    private String preparationNote;

    @Column(columnDefinition = "TEXT")
    private String jobRequirements;

    @OneToMany(mappedBy = "jobOpportunity", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Communication> communications = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "job_opportunity_contacts", joinColumns = @JoinColumn(name = "job_opportunity_id"), inverseJoinColumns = @JoinColumn(name = "person_id"))
    private List<Person> contacts = new ArrayList<>();

    public JobOpportunity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public JobProfile getJobProfile() { return jobProfile; }
    public void setJobProfile(JobProfile jobProfile) { this.jobProfile = jobProfile; }
    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getJobPostingUrl() { return jobPostingUrl; }
    public void setJobPostingUrl(String jobPostingUrl) { this.jobPostingUrl = jobPostingUrl; }
    public String getApplicationLoginUrl() { return applicationLoginUrl; }
    public void setApplicationLoginUrl(String applicationLoginUrl) { this.applicationLoginUrl = applicationLoginUrl; }
    public String getApplicationLoginInfo() { return applicationLoginInfo; }
    public void setApplicationLoginInfo(String applicationLoginInfo) { this.applicationLoginInfo = applicationLoginInfo; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDate getApplicationDate() { return applicationDate; }
    public void setApplicationDate(LocalDate applicationDate) { this.applicationDate = applicationDate; }
    public String getPreparationNote() { return preparationNote; }
    public void setPreparationNote(String preparationNote) { this.preparationNote = preparationNote; }
    public String getJobRequirements() { return jobRequirements; }
    public void setJobRequirements(String jobRequirements) { this.jobRequirements = jobRequirements; }
    public List<Communication> getCommunications() { return communications; }
    public void setCommunications(List<Communication> communications) { this.communications = communications; }
    public List<Person> getContacts() { return contacts; }
    public void setContacts(List<Person> contacts) { this.contacts = contacts; }
}
