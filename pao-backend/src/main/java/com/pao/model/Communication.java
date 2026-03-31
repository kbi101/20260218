package com.pao.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "communications")
public class Communication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "job_opportunity_id", nullable = false)
    private JobOpportunity jobOpportunity;

    @Column(nullable = false)
    private OffsetDateTime date;

    private String type; // EMAIL, PHONE, NOTE, INTERVIEW

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String body;

    private String fromAddress;
    private String toAddress;

    // Link to localhost:3004 storage for local document copies
    private String localDocUrl;

    public Communication() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public JobOpportunity getJobOpportunity() { return jobOpportunity; }
    public void setJobOpportunity(JobOpportunity jobOpportunity) { this.jobOpportunity = jobOpportunity; }
    public OffsetDateTime getDate() { return date; }
    public void setDate(OffsetDateTime date) { this.date = date; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getFromAddress() { return fromAddress; }
    public void setFromAddress(String fromAddress) { this.fromAddress = fromAddress; }
    public String getToAddress() { return toAddress; }
    public void setToAddress(String toAddress) { this.toAddress = toAddress; }
    public String getLocalDocUrl() { return localDocUrl; }
    public void setLocalDocUrl(String localDocUrl) { this.localDocUrl = localDocUrl; }
}
