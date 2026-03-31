package com.pao.repository;

import com.pao.model.Person;
import com.pao.model.ResumeSnippet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeSnippetRepository extends JpaRepository<ResumeSnippet, Long> {
    List<ResumeSnippet> findByPersonId(Long personId);
}
