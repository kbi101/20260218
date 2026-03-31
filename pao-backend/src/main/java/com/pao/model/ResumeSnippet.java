package com.pao.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "resume_snippets")
public class ResumeSnippet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String duration;

    @Column(columnDefinition = "TEXT")
    private String briefing;

    @Column(columnDefinition = "TEXT")
    private String technicalStacks;

    @Column(columnDefinition = "TEXT")
    private String roi;

    @Column(columnDefinition = "TEXT")
    private String company;
    @Column(columnDefinition = "TEXT")
    private String role;
    private String type; // e.g., "EXPERIENCE", "SUMMARY", "EDUCATION", "SKILL", "LEADERSHIP"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id")
    @JsonIgnore
    private Person person;

    public ResumeSnippet() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    
    public String getBriefing() { return briefing; }
    public void setBriefing(String briefing) { this.briefing = briefing; }
    
    public String getTechnicalStacks() { return technicalStacks; }
    public void setTechnicalStacks(String technicalStacks) { this.technicalStacks = technicalStacks; }
    
    public String getRoi() { return roi; }
    public void setRoi(String roi) { this.roi = roi; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public Person getPerson() { return person; }
    public void setPerson(Person person) { this.person = person; }
}
