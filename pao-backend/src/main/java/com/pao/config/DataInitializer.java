package com.pao.config;

import com.pao.model.RelationshipTypeEntity;
import com.pao.repository.RelationshipTypeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(RelationshipTypeRepository repository) {
        return args -> {
            List<String> personalTypes = Arrays.asList("WIFE", "SON", "BROTHER", "FRIEND", "HUSBAND", "DAUGHTER",
                    "SISTER");
            List<String> businessTypes = Arrays.asList("WORKS_WITH", "PARTNER", "VENDOR", "CLIENT", "COMPETITOR",
                    "COLLABORATES_WITH", "MEMBER_OF");

            // Personal
            for (String type : personalTypes) {
                if (repository.findByName(type).isEmpty()) {
                    String direction = Arrays.asList("WIFE", "HUSBAND", "FRIEND", "BROTHER", "SISTER").contains(type)
                            ? "BIDIRECTIONAL"
                            : "FORWARD";
                    repository.save(
                            new RelationshipTypeEntity(type, "PERSONAL", "Legacy personal relationship", direction));
                }
            }

            // Business
            for (String type : businessTypes) {
                if (repository.findByName(type).isEmpty()) {
                    String direction = Arrays.asList("PARTNER", "COLLABORATES_WITH").contains(type) ? "BIDIRECTIONAL"
                            : "FORWARD";
                    repository.save(
                            new RelationshipTypeEntity(type, "BUSINESS", "Legacy business relationship", direction));
                }
            }

            // Other
            if (repository.findByName("OTHER").isEmpty()) {
                repository.save(new RelationshipTypeEntity("OTHER", "OTHER", "Generic relationship category"));
            }
        };
    }
}
