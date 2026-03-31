package com.pao.controller;

import com.pao.model.GraphNodePosition;
import com.pao.repository.GraphNodePositionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/graph/positions")
public class GraphNodePositionController {

    @Autowired
    private GraphNodePositionRepository repository;

    @GetMapping
    public List<GraphNodePosition> getAllPositions() {
        return repository.findAll();
    }

    @PostMapping
    public List<GraphNodePosition> savePositions(@RequestBody List<GraphNodePosition> positions) {
        return repository.saveAll(positions);
    }

    @DeleteMapping
    public void deleteAllPositions() {
        repository.deleteAll();
    }
}
