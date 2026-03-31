package com.pao.repository;

import com.pao.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    List<Organization> findByParentIsNull();

    java.util.Optional<Organization> findByNameIgnoreCase(String name);
}
