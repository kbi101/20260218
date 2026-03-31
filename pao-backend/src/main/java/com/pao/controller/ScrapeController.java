package com.pao.controller;

import com.pao.model.ScrapeRequest;
import com.pao.service.ScrapeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/scrape")
public class ScrapeController {

    private final ScrapeService scrapeService;

    @Autowired
    public ScrapeController(ScrapeService scrapeService) {
        this.scrapeService = scrapeService;
    }

    @PostMapping
    public Map<String, String> scrapeJob(@RequestBody ScrapeRequest request) {
        return scrapeService.scrapeJob(request.getUrl());
    }
}
