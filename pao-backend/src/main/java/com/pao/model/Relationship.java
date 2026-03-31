package com.pao.model;

import jakarta.persistence.*;

@Entity
@Table(name = "relationships")
public class Relationship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "source_person_id")
    private Person sourcePerson;

    @ManyToOne
    @JoinColumn(name = "target_person_id")
    private Person targetPerson;

    @ManyToOne
    @JoinColumn(name = "source_organization_id")
    private Organization sourceOrganization;

    @ManyToOne
    @JoinColumn(name = "target_organization_id")
    private Organization targetOrganization;

    @Column(name = "type", nullable = false)
    private String type;

    public Relationship() {}

    public Relationship(Person sourcePerson, Person targetPerson, String type) {
        this.sourcePerson = sourcePerson;
        this.targetPerson = targetPerson;
        this.type = type;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Person getSourcePerson() { return sourcePerson; }
    public void setSourcePerson(Person sourcePerson) { this.sourcePerson = sourcePerson; }
    public Person getTargetPerson() { return targetPerson; }
    public void setTargetPerson(Person targetPerson) { this.targetPerson = targetPerson; }
    public Organization getSourceOrganization() { return sourceOrganization; }
    public void setSourceOrganization(Organization sourceOrganization) { this.sourceOrganization = sourceOrganization; }
    public Organization getTargetOrganization() { return targetOrganization; }
    public void setTargetOrganization(Organization targetOrganization) { this.targetOrganization = targetOrganization; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
