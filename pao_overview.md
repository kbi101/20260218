# PAO Architecture Overview

Based on a comprehensive review of the codebase, here is a detailed breakdown of the PAO (People & Organization) application architecture.

## Full-Stack Architecture

PAO is a full-stack web application built with a **Spring Boot** (Java) backend and an **Angular** (TypeScript) frontend. It uses **PostgreSQL** as its relational database. The application is containerized using **Docker** for standardized deployment.

---

## 1. Backend Design (Spring Boot)

The backend follows a standard RESTful API and layered architecture (`Controller -> Service -> Repository -> Model`).

### Data Models (Domain)
The entity models define a directed graph structure where Entities are nodes and Relationships are edges:
- `Person`: Represents individuals. Contains specific contact info (phones array, social links map) and a Many-to-Many connection to Organizations (for membership).
- `Organization`: Represents companies, families, or non-profits. Contains a self-referencing Many-To-One `parent` and One-To-Many `children` hierarchy.
- `Relationship`: Acts as the edges in the network. Links Source (Person/Org) to Target (Person/Org) with a specific type string.
- `RelationshipTypeEntity`: Defines the metadata for relationships, including Category (PERSONAL, BUSINESS, OTHER) and Direction (`FORWARD`, `BACKWARD`, `BIDIRECTIONAL`).
- `JobProfile`, `JobOpportunity`, `Communication`: Represents the Job Seeker pipeline, mapping user career goals and tracking target applications and recruiter communications.

### Controllers (API Endpoints)
Exposes standard CRUD operations via REST:
- `/api/people`: Manage individuals and trigger AI enrichment (`/{id}/enrich`).
- `/api/organizations`: Manage orgs, handle hierarchical parent/child linking, and trigger AI enrichment.
- `/api/relationships`: Manage the connections between entities.
- `/api/relationship-types`: Manage the rules and schema of the relationships.
- `/api/job-profiles`, `/api/job-opportunities`, `/api/communications`: Manage the Job Seeker career goals, active applications, and email sync functionality.

### Enrichment Services
The backend contains specific `EnrichmentService` classes that integrate with an AI service (likely Gemini as per the `pao.md` docs) to perform automatic web-scraping and data extraction to auto-fill profiles.

---

## 2. Frontend Design (Angular)

The frontend is a single-page application (SPA) focused on interactive management and visualization.

### Routing & Views
The application maps directly to the entity domains:
- `/graph` (Home): Visual network exploration.
- `/people`: List and form views for individuals.
- `/organizations`: List and form views for companies.
- `/relationship-types`: Administration of relationship definitions.
- `/job-seeker`: Custom workspace for managing Job Profiles, target Organizations, and logging communications.

### Key Components
- **Graph Hub (`GraphComponent`)**: The core visualization engine.
  - Uses `cytoscape.js` with the `fcose` layout algorithm for highly interactive, physics-based network rendering.
  - Supports node coloring by type (e.g., Pink for Family orgs, Blue for People), edge directionality, and complex Breadth-First-Search (BFS) focus filtering to explore local neighborhoods.
  - Persists view states and filters to `localStorage`.
- **Entity Forms (`PersonFormComponent`, `OrganizationFormComponent`)**: 
  - Handle data entry and feature a direct UI trigger (`enrichFromWeb()`) to call the backend AI enrichment endpoints.

### State Management
State management is handled gracefully using `rxjs` `BehaviorSubject`s within the Angular Services (e.g., `PersonService.personToEdit$`, `refreshList$`). This provides a lightweight reactive approach, ensuring that when an entity is added or updated in a form, the corresponding lists and the main graph visualization automatically re-render without requiring a full page reload or complex Redux-like boilerplate.

---

## Conclusion
PAO is a well-structured application that elegantly maps a relational database model into a dynamic graph visualization. Its standout architectural choices include the tight integration of AI enrichment hooks into standard CRUD flows and the use of reactive state management to keep the heavy graph visualization perfectly synchronized with underlying data changes.
