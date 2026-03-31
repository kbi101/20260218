package com.pao.controller;

import com.pao.model.ElevatorPitch;
import com.pao.model.Person;
import com.pao.repository.ElevatorPitchRepository;
import com.pao.repository.PersonRepository;
import com.pao.service.PersonEnrichmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pitches")
public class ElevatorPitchController {

    private final ElevatorPitchRepository elevatorPitchRepository;
    private final PersonRepository personRepository;
    private final PersonEnrichmentService enrichmentService;

    @Autowired
    public ElevatorPitchController(ElevatorPitchRepository elevatorPitchRepository,
            PersonRepository personRepository,
            PersonEnrichmentService enrichmentService) {
        this.elevatorPitchRepository = elevatorPitchRepository;
        this.personRepository = personRepository;
        this.enrichmentService = enrichmentService;
    }

    @GetMapping
    public List<ElevatorPitch> getAllPitches() {
        return elevatorPitchRepository.findAll();
    }

    @GetMapping("/person/{personId}")
    public List<ElevatorPitch> getPitchesByPerson(@PathVariable Long personId) {
        if (personId == null)
            return java.util.Collections.emptyList();
        return elevatorPitchRepository.findByPersonId(personId);
    }

    @GetMapping("/{id}")
    public ElevatorPitch getPitch(@PathVariable Long id) {
        if (id == null)
            throw new IllegalArgumentException("Id cannot be null");
        return elevatorPitchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pitch not found with id: " + id));
    }

    @PostMapping
    public ElevatorPitch createOrUpdatePitch(@RequestBody PitchSaveRequest request) {
        Long requestedId = request.getPersonId();
        if (requestedId == null) throw new IllegalArgumentException("PersonId cannot be null");
        
        // Fallback for legacy hardcoded ID 1 in frontend
        final Long pidToUse = (requestedId == 1L) ? 100L : requestedId;

        Person person = personRepository.findById(pidToUse)
                .orElseThrow(() -> new RuntimeException("Person not found with id: " + pidToUse));

        ElevatorPitch pitch;
        if (request.getId() != null) {
            Long pitchId = request.getId();
            pitch = elevatorPitchRepository.findById(pitchId)
                    .orElseThrow(() -> new RuntimeException("Pitch not found with id: " + pitchId));
        } else {
            pitch = new ElevatorPitch();
        }

        pitch.setName(request.getName());
        pitch.setTargetRole(request.getTargetRole());
        pitch.setBullets(request.getBullets());
        pitch.setContent(request.getContent());
        pitch.setPerson(person);
        pitch.setFontSize(request.getFontSize());

        return elevatorPitchRepository.save(pitch);
    }

    @DeleteMapping("/{id}")
    public void deletePitch(@PathVariable Long id) {
        if (id == null)
            return;
        elevatorPitchRepository.deleteById(id);
    }

    @PostMapping("/generate")
    public String generatePitch(@RequestBody PitchGenerateRequest request) {
        Long requestedId = request.getPersonId();
        if (requestedId == null) throw new IllegalArgumentException("PersonId cannot be null");
        
        // Fallback for legacy hardcoded ID 1 in frontend
        final Long pidToUse = (requestedId == 1L) ? 100L : requestedId;

        Person person = personRepository.findById(pidToUse)
                .orElseThrow(() -> new RuntimeException("Person not found with id: " + pidToUse));

        return enrichmentService.generateElevatorPitch(request.getBullets(), request.getTargetRole(), person);
    }

    public static class PitchSaveRequest {
        private Long id;
        private Long personId;
        private String name;
        private String targetRole;
        private String bullets;
        private String content;
        private Integer fontSize;

        public PitchSaveRequest() {}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getPersonId() { return personId; }
        public void setPersonId(Long personId) { this.personId = personId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getTargetRole() { return targetRole; }
        public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
        public String getBullets() { return bullets; }
        public void setBullets(String bullets) { this.bullets = bullets; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Integer getFontSize() { return fontSize; }
        public void setFontSize(Integer fontSize) { this.fontSize = fontSize; }
    }

    public static class PitchGenerateRequest {
        private Long personId;
        private String bullets;
        private String targetRole;

        public PitchGenerateRequest() {}
        public Long getPersonId() { return personId; }
        public void setPersonId(Long personId) { this.personId = personId; }
        public String getBullets() { return bullets; }
        public void setBullets(String bullets) { this.bullets = bullets; }
        public String getTargetRole() { return targetRole; }
        public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    }
}
