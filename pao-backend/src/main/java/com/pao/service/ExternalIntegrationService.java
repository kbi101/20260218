package com.pao.service;

import com.pao.model.Communication;
import com.pao.model.JobOpportunity;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExternalIntegrationService {

    // Mock Gmail Import - In a real app, this uses Google OAuth2 API
    // We generate dummy data for the demonstration.
    public List<Communication> mockImportFromGmail(JobOpportunity opp) {
        List<Communication> newComms = new ArrayList<>();

        String orgName = opp.getOrganization() != null ? opp.getOrganization().getName() : "Unknown";
        String domain = orgName.toLowerCase().replaceAll("\\s+", "") + ".com";

        Communication comm1 = new Communication();
        comm1.setJobOpportunity(opp);
        comm1.setDate(OffsetDateTime.now().minusDays(2));
        comm1.setType("EMAIL");
        comm1.setSubject("Thanks for applying to " + orgName);
        comm1.setBody("Hi there,\n\nWe received your application for " + opp.getJobTitle()
                + " and are reviewing it.\n\nBest,\nRecruiting Team");
        comm1.setFromAddress("careers@" + domain);
        comm1.setToAddress("jobseeker@example.com");

        Communication comm2 = new Communication();
        comm2.setJobOpportunity(opp);
        comm2.setDate(OffsetDateTime.now().minusHours(4));
        comm2.setType("EMAIL");
        comm2.setSubject("Interview Request");
        comm2.setBody("We would like to schedule a 30-minute intro call. Let us know your availability.");
        comm2.setFromAddress("recruiter@" + domain);
        comm2.setToAddress("jobseeker@example.com");

        // Example attaching a localhost:3004 document link
        comm2.setLocalDocUrl("http://localhost:3004/" + opp.getId() + "_interview_prep.pdf");

        newComms.add(comm1);
        newComms.add(comm2);

        return newComms;
    }
}
