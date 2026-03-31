package com.pao.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "organizations")
public class Organization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String type; // e.g., COMPANY, FAMILY, NON_PROFIT, OTHER

    private String address;

    private String website;

    private String email;

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String profileMd;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonIgnore
    private Organization parent;

    @OneToMany(mappedBy = "parent", cascade = { CascadeType.PERSIST, CascadeType.MERGE }, fetch = FetchType.EAGER)
    private List<Organization> children = new ArrayList<>();

    public Organization() {}

    public Organization(String name, String type, String address) {
        this.name = name;
        this.type = type;
        this.address = address;
    }

    public Organization(String name, String address) {
        this.name = name;
        this.type = "COMPANY"; // Default for legacy code
        this.address = address;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getProfileMd() { return profileMd; }
    public void setProfileMd(String profileMd) { this.profileMd = profileMd; }
    public Organization getParent() { return parent; }
    public void setParent(Organization parent) { this.parent = parent; }
    public List<Organization> getChildren() { return children; }
    public void setChildren(List<Organization> children) { this.children = children; }
}
