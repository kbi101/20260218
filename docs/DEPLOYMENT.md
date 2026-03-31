# PAO: Deployment & Development Guide

This document describes how to set up, build, and deploy PAO in different environments.

## 1. Environment Setup

Copy `.env.example` to `.env.local` to start.

### Key Configuration
- `GEMINI_KEY`: Your Google Gemini API Key.
- `ALPHA_VANTAGE_KEY`: For real-time stock processing (Alpha Vantage).
- `DEFAULT_MODEL`: (e.g. `gemini-2.5-flash`).
- `OLLAMA_URL`: Typically `http://host.docker.internal:11434`.
- `OLLAMA_MODEL`: (e.g. `llama3.1:8b`).

## 2. Dockerized Deployment

Deployment is handled via a single script that manages build and container lifecycle:

```bash
# PAO Robust Build and Deploy
./devops/deploy.sh
```

### Components in Docker
1. **Frontend-Build Stage**: Compiles React with Vite using `node:20-alpine`.
2. **Backend-Build Stage**: Compiles Java with Maven using `maven:3.9-eclipse-temurin-23-alpine`.
3. **Runtime Stage**: A minimal `eclipse-temurin:23-jre-alpine` runtime running the final fat `.jar`.

### Volume Persistence
The database and logs are persisted to your local machine via:
`-v "$(pwd)/data:/app/data"`

## 3. SQLite vs. PostgreSQL

- **Demo/Local Mode**: Set `DB_URL=jdbc:sqlite:/app/data/pao.db` in `.env.local`. This provides a zero-config, portable database file.
- **Production Mode**: Use the commented-out PostgreSQL lines in `.env.local`. Ensure your Postgres container is and reachable at `host.docker.internal`.

## 4. Manual Seeding

Use the Python 3 script to reset the database to the high-fidelity demo state (John Doe, ServiceTitan, Apex Talent, etc.):

```bash
python3 seed_demo_data.py
```

## 5. Development Workflow

- **Backend**: Standard Spring Boot project. Use `./mvnw spring-boot:run` for native local development.
- **Frontend**: Standard Vite + React project. Use `npm run dev` in `pao-frontend-react`.
- **API Proxy**: Frontend is pre-configured to proxy `/api` requests to `http://localhost:8080`.

---
*DevOps & System Engineering documentation v3.21.2*
