package com.pao.controller;

import com.pao.exception.QuotaExceededException;
import com.pao.model.Person;
import com.pao.model.ResumeSnippet;
import com.pao.repository.PersonRepository;
import com.pao.repository.ResumeSnippetRepository;
import com.pao.service.ResumeSnippetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/persons/{personId}/snippets")
public class ResumeSnippetController {

    private final ResumeSnippetRepository resumeSnippetRepository;
    private final PersonRepository personRepository;
    private final ResumeSnippetService resumeSnippetService;

    @Autowired
    public ResumeSnippetController(ResumeSnippetRepository resumeSnippetRepository,
            PersonRepository personRepository,
            ResumeSnippetService resumeSnippetService) {
        this.resumeSnippetRepository = resumeSnippetRepository;
        this.personRepository = personRepository;
        this.resumeSnippetService = resumeSnippetService;
    }

    @GetMapping
    public List<ResumeSnippet> getSnippets(@PathVariable Long personId) {
        return resumeSnippetRepository.findByPersonId(personId);
    }

    @PostMapping
    public ResumeSnippet createOrUpdateSnippet(@PathVariable Long personId, @RequestBody ResumeSnippet snippet) {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new RuntimeException("Person not found"));
        
        snippet.setPerson(person);
        return resumeSnippetRepository.save(snippet);
    }

    @DeleteMapping("/{id}")
    public void deleteSnippet(@PathVariable Long personId, @PathVariable Long id) {
        Long snippetId = id;
        resumeSnippetRepository.deleteById(snippetId);
    }

    @PostMapping("/extract")
    public ResponseEntity<?> extractSnippets(
            @PathVariable Long personId,
            @RequestBody ExtractRequest request) {
        try {
            List<ResumeSnippet> snippets = resumeSnippetService.extractSnippets(personId, request.getResumeContent());
            return ResponseEntity.ok(snippets);
        } catch (QuotaExceededException e) {
            Map<String, String> response = new HashMap<>(); // need HashMap import
            response.put("error", "QUOTA_EXCEEDED");
            response.put("prompt", e.getPrompt());
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/manual-save")
    public ResponseEntity<List<ResumeSnippet>> saveManualExtraction(
            @PathVariable Long personId,
            @RequestBody String rawJson) {
        try {
            List<ResumeSnippet> snippets = resumeSnippetService.parseAndSaveSnippets(personId, rawJson);
            return ResponseEntity.ok(snippets);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/compose")
    public ResponseEntity<String> composeResume(
            @PathVariable Long personId,
            @RequestBody ComposeRequest request) {
        try {
            List<ResumeSnippet> snippets = resumeSnippetRepository.findAllById(request.getSnippetIds());
            if (snippets.isEmpty()) {
                snippets = resumeSnippetRepository.findByPersonId(personId); // fallback or empty checks
            }
            String composed = resumeSnippetService.composeResume(snippets, request.getJobDescription());
            return ResponseEntity.ok(composed);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error composing resume");
        }
    }

    static class ExtractRequest {
        private String resumeContent;
        public String getResumeContent() { return resumeContent; }
        public void setResumeContent(String resumeContent) { this.resumeContent = resumeContent; }
    }

    static class ComposeRequest {
        private String jobDescription;
        private List<Long> snippetIds;
        public String getJobDescription() { return jobDescription; }
        public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
        public List<Long> getSnippetIds() { return snippetIds; }
        public void setSnippetIds(List<Long> snippetIds) { this.snippetIds = snippetIds; }
    }
}
