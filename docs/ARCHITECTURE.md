# PAO: Technical Architecture & Design

PAO (Professional AI Orchestrator) is a distributed platform designed for high-fidelity professional information management and AI-assisted career engineering.

## 1. System Components

The system architecture follows a 3-tier model with a focus on **AI Resilience**:

### 🧠 **Inference Engine (AIService.java)**
- **Cloud Layer**: Primary processing via **Google Gemini 2.5 Flash** (v1 API).
- **Local Layer**: Native failover to **Ollama** (`llama3.1:8b`) via `host.docker.internal`.
- **Logic**: Automated fallback on 503/429 errors ensures generation never fails even during quota limits or API outages.

### 🕸️ **Knowledge Graph (Backend Core)**
- **Entities**: 1st-class citizens for **Person**, **Organization**, and **Relationship**.
- **Schema Resilience**: Using SQLite for quick, stateful demo deployments while maintaining PostgreSQL compatibility for production scaling.
- **Persistence**: Managed via Spring Data JPA with robust audit logging (`task_logs`).

### 🎨 **Intelligent Frontend (React Hub)**
- **State Management**: React Query (TanStack) for resilient caching and re-fetching.
- **Micro-Animations**: Framer Motion for smooth transitions and hover states.
- **Teleprompter Logic**: Native JavaScript interval-driven scrolling with adjustable speed and font size (Practice Mode).

## 2. Professional Data Model

The core data structure revolves around entities and their interconnecting relationships:

```mermaid
erDiagram
    PERSON {
        bigint id PK
        varchar first_name
        varchar last_name
        boolean is_primary
    }
    ORGANIZATION {
        bigint id PK
        varchar name
        varchar type
        varchar website
    }
    RELATIONSHIP {
        bigint id PK
        varchar type
        bigint source_person_id FK
        bigint target_person_id FK
        bigint source_organization_id FK
        bigint target_organization_id FK
    }
    RELATIONSHIP_TYPE {
        bigint id PK
        varchar name UK
        varchar category
    }
    JOB_PROFILE {
        bigint id PK
        varchar title
        varchar target_industry
    }
    JOB_OPPORTUNITY {
        bigint id PK
        varchar status
        bigint organization_id FK
        bigint job_profile_id FK
    }
    RESUME_SNIPPET {
        bigint id PK
        varchar type
        text briefing
        text roi
        bigint person_id FK
    }
    RESUME {
        bigint id PK
        varchar name
        text content
        bigint person_id FK
    }
    COMMUNICATION {
        bigint id PK
        varchar type
        bigint job_opportunity_id FK
    }
    
    PERSON ||--o{ RELATIONSHIP : "is source/target"
    PERSON ||--o{ RESUME_SNIPPET : "owns"
    PERSON ||--o{ RESUME : "owns versions"
    ORGANIZATION ||--o{ RELATIONSHIP : "is source/target"
    ORGANIZATION ||--o{ JOB_OPPORTUNITY : "targets"
    RELATIONSHIP_TYPE ||--o{ RELATIONSHIP : "defines"
    JOB_PROFILE ||--o{ JOB_OPPORTUNITY : "belongs to"
    JOB_OPPORTUNITY ||--o{ COMMUNICATION : "logs"
```

## 3. Frontend Component Design (React Hub)

The frontend is built on a modular, component-driven architecture designed for high-impact interactivity.

### **Component Hierarchy**
```mermaid
graph TD
    App[App.tsx] --> Layout[MainLayout.tsx]
    Layout --> Nav[SideNavbar.tsx]
    Layout --> Search[IntelligenceSearch.tsx]
    
    Layout --> Dashboard[DashboardPage.tsx]
    Layout --> Leads[LeadsBoardPage.tsx]
    Layout --> Network[IntelligenceHubPage.tsx]
    Layout --> Prep[PrepPage.tsx]
    Layout --> Resumes[ResumesPage.tsx]
    
    Leads --> LeadCard[LeadCard.tsx]
    Network --> Graph[ProfessionalGraph.tsx]
    Prep --> Teleprompter[Teleprompter.tsx]
    Resumes --> Snippets[SnippetLibrary.tsx]
    Resumes --> Compose[ComposeModal.tsx]
    
    Graph --> ReactFlow[ReactFlow Library]
    Teleprompter --> Motion[Framer Motion]
```

### **Core UI Principles**
- **Dynamic Caching**: TanStack Query manages all high-latency AI and scraping data fetches.
- **Micro-Interactions**: All status transitions (Applied -> Interviewing) are handled with optimistic updates.
- **Teleprompter Logic**: Native state-driven scrolling ensuring distraction-free practice.

## 4. Backend Service Architecture (Spring Boot)

The backend follows a clean, service-oriented design specialized in professional data orchestration.

### **Service Layer Design**
```mermaid
graph LR
    API[REST Controllers] --> Service[Service Layer]
    Service --> AI[AIService / LLM Orchestration]
    Service --> Scraper[ScrapeService / Jsoup]
    Service --> Repo[Repository Layer / Spring Data JPA]
    Repo --> DB[(SQLite / PostgreSQL)]
    
    AI --> Provider[Gemini / Ollama Failover]
```

### **Key Service Modules**
1. **Network Intelligence Hub**: Manages complex graph relationships and recruiter-to-organization mapping.
2. **Resume Generator Service**: Orchestrates the synthesis of ROI snippets into markdown-formatted resumes.
3. **Resilience Engine**: Implements the dual-layer AI failover logic and transaction-safe data seeding.

## 5. Resilience & Hardening

PAO implements several production-grade hardening techniques:
- **Environment Externalization**: All sensitive keys and service URLs are strictly loaded from `.env.local` or environment variables.
- **Legacy Fallback**: Backend-level mapping (e.g., ID 1 -> ID 100) ensures historical hardcoded values do not cause 500 crashes.
- **Synchronous Persistence**: Automated seeding and database initialization on startup using `SystemSettingsService`.

## 4. Advanced AI Pipelines

### **Resume Architect Pipeline**
1. **Extraction**: AI scrapes the target job JD for core requirements.
2. **Matching**: Knowledge Engine finds high-impact `RESUME_SNIPPET` entities belonging to the user.
3. **Generation**: LLM synthesizes a Markdown resume, prioritizing ROI and technical stack alignment.

### **Lead Intake Scraper**
- Integrated **JSoup** scraping with **AI parsing** to transform unstructured company career pages into clean `JOB_OPPORTUNITY` records.

---
*PAO Architectural Documentation v2.5*
