package com.pao.model;

import jakarta.persistence.*;

@Entity
@Table(name = "relationship_types")
public class RelationshipTypeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String category;
    private String description;

    @Column(nullable = false, columnDefinition = "varchar(255) default 'FORWARD'")
    private String direction = "FORWARD"; // FORWARD, BACKWARD, BIDIRECTIONAL

    public RelationshipTypeEntity() {}

    public RelationshipTypeEntity(String name, String category, String description) {
        this.name = name;
        this.category = category;
        this.description = description;
        this.direction = "FORWARD";
    }

    public RelationshipTypeEntity(String name, String category, String description, String direction) {
        this.name = name;
        this.category = category;
        this.description = description;
        this.direction = direction;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDirection() { return direction; }
    public void setDirection(String direction) { this.direction = direction; }
}
