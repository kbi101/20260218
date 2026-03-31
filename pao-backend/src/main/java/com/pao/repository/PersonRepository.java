package com.pao.repository;

import com.pao.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Person p JOIN p.organizations o WHERE o.id = :organizationId")
    List<Person> findByOrganizationId(Long organizationId);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Person p WHERE LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Person> searchByName(String query);
}
