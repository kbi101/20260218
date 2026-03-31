package com.pao.service;

import com.pao.model.RelationshipTypeEntity;
import com.pao.repository.RelationshipTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RelationshipTypeService {

    private final RelationshipTypeRepository repository;

    @Autowired
    public RelationshipTypeService(RelationshipTypeRepository repository) {
        this.repository = repository;
    }

    public List<RelationshipTypeEntity> getAllTypes() {
        return repository.findAll();
    }

    public RelationshipTypeEntity getTypeById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("RelationshipType not found with id: " + id));
    }

    public RelationshipTypeEntity createType(RelationshipTypeEntity newType) {
        if (repository.findByName(newType.getName()).isPresent()) {
            throw new IllegalArgumentException(
                    "RelationshipType with name '" + newType.getName() + "' already exists.");
        }
        return repository.save(newType);
    }

    public RelationshipTypeEntity updateType(Long id, RelationshipTypeEntity updatedDetails) {
        RelationshipTypeEntity existing = getTypeById(id);

        // Check for unique name conflict if changing name
        if (!existing.getName().equals(updatedDetails.getName()) &&
                repository.findByName(updatedDetails.getName()).isPresent()) {
            throw new IllegalArgumentException(
                    "RelationshipType with name '" + updatedDetails.getName() + "' already exists.");
        }

        existing.setName(updatedDetails.getName());
        existing.setCategory(updatedDetails.getCategory());
        existing.setDescription(updatedDetails.getDescription());
        existing.setDirection(updatedDetails.getDirection());

        return repository.save(existing);
    }

    public void deleteType(Long id) {
        RelationshipTypeEntity existing = getTypeById(id);
        repository.delete(existing);
    }
}
