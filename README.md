# PAO: Resilient AI Resume & Lead Intelligence System

PAO is a high-fidelity, production-hardened platform designed to automate the job search lifecycle. By combining **Knowledge Graph Networking** with **Generative AI**, PAO transforms how you manage professional relationships, track job leads, and generate tailored, ROI-driven resumes.

## 🚀 Key Features

- **Knowledge Graph Networking**: Visualize and manage complex relationships between people and organizations (CloudForge AI, ServiceTitan, etc.).
- **AI-Driven Lead Intake**: Automated scraping and extraction of job requirements from platforms like Workday and ServiceTitan.
- **Resume Architect**: Generates professional, Markdown-based resumes tailored to specific job profiles, emphasizing ROI and technical impact.
- **Practice Mode**: An interactive, teleprompter-style interface to master your elevator pitch with adjustable scrolling and font sizes.
- **Failover Resilience**: Dual-AI inference engine supporting both **Google Gemini (Cloud)** and **Ollama (Local)** to ensure 100% uptime.

## 🛠️ Technology Stack

- **Backend**: Spring Boot 3.4.2 (Java 23), Spring Data JPA.
- **Frontend**: React (Vite), TanStack Query, Lucide Icons.
- **Database**: SQLite (Demo Mode) / PostgreSQL (Production).
- **AI Engine**: Google Gemini 2.5 Flash / Ollama (Llama 3.1:8b).
- **Infrastructure**: Dockerized deployment with persistent volume mapping.

## 📂 Project Structure

```text
.
├── pao-backend/          # Spring Boot Java Backend
├── pao-frontend-react/   # React Frontend (Vite)
├── devops/               # Dockerfiles and Deployment Scripts
├── data/                 # Persistent SQLite Database
├── docs/                 # Detailed Professional Documentation
└── seed_demo_data.py     # High-fidelity Data Seeding Script
```

## 🏁 Getting Started

### Prerequisites
- Docker & Docker Compose
- Python 3 (for demo seeding)

### Quick Start
1. **Configure Environment**:
   Copy `.env.example` to `.env.local` and add your `GEMINI_KEY`.
2. **Deploy**:
   ```bash
   chmod +x devops/deploy.sh
   ./devops/deploy.sh
   ```
3. **Seed Demo Data**:
   ```bash
   python3 seed_demo_data.py
   ```
4. **Access**:
   Open [http://localhost:3012](http://localhost:3012) in your browser.

## 📖 Documentation
Detailed documentation for different audiences can be found in the [docs/](./docs) folder:
- [Technical Architecture](./docs/ARCHITECTURE.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Major Features Walkthrough](./docs/WALKTHROUGH.md)
- [Development & Deployment](./docs/DEPLOYMENT.md)

---
*Built with ❤️ for resilient AI-assisted career engineering.*
