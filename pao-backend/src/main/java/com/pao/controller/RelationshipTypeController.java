package com.pao.controller;

import com.pao.model.RelationshipTypeEntity;
import com.pao.service.RelationshipTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/relationship-types")
public class RelationshipTypeController {

    private final RelationshipTypeService service;

    @Autowired
    public RelationshipTypeController(RelationshipTypeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<RelationshipTypeEntity>> getAllRelationshipTypes() {
        return ResponseEntity.ok(service.getAllTypes());
    }

    @PostMapping
    public ResponseEntity<RelationshipTypeEntity> createRelationshipType(@RequestBody RelationshipTypeEntity type) {
        return new ResponseEntity<>(service.createType(type), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RelationshipTypeEntity> updateRelationshipType(@PathVariable Long id,
            @RequestBody RelationshipTypeEntity type) {
        return ResponseEntity.ok(service.updateType(id, type));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRelationshipType(@PathVariable Long id) {
        service.deleteType(id);
        return ResponseEntity.noContent().build();
    }
}
