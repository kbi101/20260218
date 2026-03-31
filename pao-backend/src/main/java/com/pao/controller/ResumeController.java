package com.pao.controller;

import com.pao.model.Person;
import com.pao.model.Resume;
import com.pao.repository.PersonRepository;
import com.pao.repository.ResumeRepository;
import com.pao.service.ResumeConversionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeRepository resumeRepository;
    private final PersonRepository personRepository;
    private final ResumeConversionService conversionService;

    @Autowired
    public ResumeController(ResumeRepository resumeRepository,
            PersonRepository personRepository,
            ResumeConversionService conversionService) {
        this.resumeRepository = resumeRepository;
        this.personRepository = personRepository;
        this.conversionService = conversionService;
    }

    @GetMapping
    public List<Resume> getAllResumes(@RequestParam(required = false) Long personId) {
        if (personId != null) {
            return resumeRepository.findByPersonId(personId);
        }
        return resumeRepository.findAll();
    }

    @GetMapping("/{id}")
    public Resume getResume(@PathVariable Long id) {
        if (id == null)
            throw new IllegalArgumentException("Id cannot be null");
        Long resumeId = id;
        return resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + resumeId));
    }

    @PostMapping
    public Resume createOrUpdateResume(@RequestBody ResumeSaveRequest request) {
        if (request.getPersonId() == null)
            throw new IllegalArgumentException("PersonId cannot be null");
        Long personId = request.getPersonId();
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new RuntimeException("Person not found with id: " + personId));

        Resume resume;
        if (request.getId() != null) {
            Long resumeId = request.getId();
            resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found with id: " + resumeId));
        } else {
            resume = new Resume();
        }

        resume.setName(request.getName());
        resume.setContent(request.getContent());
        resume.setPerson(person);

        return resumeRepository.save(resume);
    }

    @DeleteMapping("/{id}")
    public void deleteResume(@PathVariable Long id) {
        if (id == null)
            return;
        resumeRepository.deleteById(id);
    }

    @GetMapping("/{id}/export/{format}")
    public ResponseEntity<byte[]> exportResume(@PathVariable Long id, @PathVariable String format) throws IOException {
        if (id == null)
            throw new IllegalArgumentException("Id cannot be null");
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + id));

        byte[] data;
        String filename = resume.getName().replaceAll("\\s+", "_");
        MediaType mediaType;

        try {
            if ("pdf".equalsIgnoreCase(format)) {
                data = conversionService.convertMarkdownToPdf(resume.getContent());
                filename += ".pdf";
                mediaType = MediaType.APPLICATION_PDF;
            } else if ("word".equalsIgnoreCase(format) || "docx".equalsIgnoreCase(format)) {
                data = conversionService.convertMarkdownToWord(resume.getContent());
                filename += ".docx";
                mediaType = new MediaType("application", "vnd.openxmlformats-officedocument.wordprocessingml.document");
            } else {
                throw new IllegalArgumentException("Unsupported format: " + format);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(data);
    }

    @PostMapping("/import")
    public ResponseEntity<String> importResume(@RequestParam("file") MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null)
            return ResponseEntity.badRequest().body("Invalid file");

        String content;
        if (originalFilename.toLowerCase().endsWith(".pdf")) {
            content = conversionService.importFromPdf(file);
        } else if (originalFilename.toLowerCase().endsWith(".docx")
                || originalFilename.toLowerCase().endsWith(".doc")) {
            content = conversionService.importFromWord(file);
        } else {
            return ResponseEntity.badRequest().body("Unsupported file type. Please upload a PDF or Word document.");
        }

        return ResponseEntity.ok(content);
    }

    public static class ResumeSaveRequest {
        private Long id;
        private Long personId;
        private String name;
        private String content;

        public ResumeSaveRequest() {}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getPersonId() { return personId; }
        public void setPersonId(Long personId) { this.personId = personId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
