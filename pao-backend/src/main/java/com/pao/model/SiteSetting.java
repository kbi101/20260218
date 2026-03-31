package com.pao.model;

import jakarta.persistence.*;

@Entity
@Table(name = "site_settings")
public class SiteSetting {
    @Id
    private String key;

    @Column(name = "setting_value", length = 2048)
    private String value;

    @Column(name = "description")
    private String description;

    public SiteSetting() {}

    public SiteSetting(String key, String value, String description) {
        this.key = key;
        this.value = value;
        this.description = description;
    }

    // Manual Getters and Setters
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
