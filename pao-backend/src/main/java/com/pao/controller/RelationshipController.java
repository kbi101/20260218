package com.pao.controller;

import com.pao.model.Relationship;
import com.pao.service.RelationshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/relationships")
public class RelationshipController {

    private final RelationshipService relationshipService;

    @Autowired
    public RelationshipController(RelationshipService relationshipService) {
        this.relationshipService = relationshipService;
    }

    @GetMapping
    public List<Relationship> getAllRelationships() {
        return relationshipService.getAllRelationships();
    }

    @GetMapping("/person/{personId}")
    public List<Relationship> getRelationshipsForPerson(@PathVariable Long personId) {
        return relationshipService.getRelationshipsForPerson(personId);
    }

    @GetMapping("/organization/{orgId}")
    public List<Relationship> getRelationshipsForOrganization(@PathVariable Long orgId) {
        return relationshipService.getRelationshipsForOrganization(orgId);
    }

    @PostMapping
    public Relationship addRelationship(@RequestBody RelationshipRequest request) {
        return relationshipService.addRelationship(
                request.getSourceId(),
                request.getTargetId(),
                request.getSourceType(),
                request.getTargetType(),
                request.getType());
    }

    @DeleteMapping("/{id}")
    public void deleteRelationship(@PathVariable Long id) {
        relationshipService.deleteRelationship(id);
    }

    public static class RelationshipRequest {
        private Long sourceId;
        private Long targetId;
        private String sourceType;
        private String targetType;
        private String type;

        public RelationshipRequest() {}

        public Long getSourceId() { return sourceId; }
        public void setSourceId(Long sourceId) { this.sourceId = sourceId; }
        public Long getTargetId() { return targetId; }
        public void setTargetId(Long targetId) { this.targetId = targetId; }
        public String getSourceType() { return sourceType; }
        public void setSourceType(String sourceType) { this.sourceType = sourceType; }
        public String getTargetType() { return targetType; }
        public void setTargetType(String targetType) { this.targetType = targetType; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}
