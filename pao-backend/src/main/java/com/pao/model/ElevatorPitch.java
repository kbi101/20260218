package com.pao.model;

import jakarta.persistence.*;

@Entity
@Table(name = "elevator_pitches")
public class ElevatorPitch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // Anchor name (e.g., "Senior Dev Pitch")

    private String targetRole;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String bullets;

    private Integer fontSize; // Font size in pixels

    @ManyToOne
    @JoinColumn(name = "person_id")
    private Person person;

    public ElevatorPitch() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getBullets() { return bullets; }
    public void setBullets(String bullets) { this.bullets = bullets; }
    public Integer getFontSize() { return fontSize; }
    public void setFontSize(Integer fontSize) { this.fontSize = fontSize; }
    public Person getPerson() { return person; }
    public void setPerson(Person person) { this.person = person; }
}
