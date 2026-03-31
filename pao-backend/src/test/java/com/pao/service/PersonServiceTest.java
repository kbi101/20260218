package com.pao.service;

import com.pao.model.Person;
import com.pao.repository.PersonRepository;
import com.pao.repository.RelationshipRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PersonServiceTest {
    @Mock
    private PersonRepository personRepository;

    @Mock
    private RelationshipRepository relationshipRepository;

    @InjectMocks
    private PersonService personService;

    @Test
    void testCreatePerson() {
        // Arrange
        Person personA = new Person("Person", "A");
        doReturn(personA).when(personRepository).save(any(Person.class));

        // Act
        Person saved = personService.createPerson(personA);

        // Assert
        assertNotNull(saved);
        assertEquals("Person", saved.getFirstName());
        assertEquals("A", saved.getLastName());
        verify(personRepository, times(1)).save(personA);
    }
}
