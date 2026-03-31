# PAO: People & Organization

**PAO** is a comprehensive relationship management and visualization application designed to track, manage, and visualize connections between individuals and organizations. It provides a visual graph-based approach to understanding complex networks of relationships.

## Key Features

### 1. People Management
- **Create Profiles:** Add people with details such as First Name, Last Name, and Date of Birth.
- **Manage Individuals:** Read, update, and delete individual records.

### 2. Organization Management
- **Categorization:** Classify organizations functionally via `Type` (e.g., COMPANY, FAMILY, NON_PROFIT).
- **Hierarchical Structure:** Establish parent-child relationships (e.g., holding companies and subsidiaries).
- **Organization Details:** Store and update foundational data including Name, Description, and Contact Information (`website`, `email`, `phone`, `address`).
- **Lifecycle Management:** Delete organizations (safely cascading or clearing associated relationships).

### 3. Dynamic Relationship Management
- **Customizable Types:** Define dynamic relationship types (e.g., WIFE, VENDOR, CLIENT, SUBSIDIARY) mapped to specific categories (PERSONAL, BUSINESS, OTHER).
- **Flexible Connections:** Connect any combination of Person-to-Person, Organization-to-Organization, or Person-to-Organization.
- **Directional Links:** Define the flow of the network via `Direction` (`FORWARD`, `BACKWARD`, or `BIDIRECTIONAL`) at the type level. Relationships have a defined Source and Target.
- **Business Logic Enforcement:** Systematically enforces rules, such as restricting a Person to be a `MEMBER_OF` only one Organization at a time.
- **Predefined Constraints:** Standard relations like `FRIEND` automatically trigger as `BIDIRECTIONAL` without manual intervention.

### 4. Graph Hub Visualization
- **Interactive Network Graph:** View the entire network of people and organizations visually using Cytoscape.js.
- **Smart Formatting:** Nodes are color-coded by entity and type (e.g., `FAMILY` organizations render as pink), and edges automatically format their arrowheads based on directionality.
- **Smart Filtering:** Filter the graph by specific Relationship Types (Personal, Business, Other), Entity Types (People only, Organizations only), or using a search query to isolate specific nodes.
- **Detail Panels:** Click on any node or edge in the graph to view its detailed information, including active links to external Contact info via the Interactive side panel.
- **Persistent State:** Graph filters and view preferences are saved locally so they persist across sessions.

### 5. AI Data Enrichment
- **Auto-Fill via Web Search:** Editing an Organization or Person allows users to seamlessly trigger a Google Gemini AI-powered scraping tool directly from the UI.
- **Zero-Touch Extraction:** The backend queries DuckDuckGo for the company's real-world footprint and pipes the raw text to Google's powerful LLM. The AI dynamically maps unstructured web data back into strict JSON.
- **Self-Healing Profiles:** The database instantly absorbs the recognized `website`, `email`, `phone`, and `address`, pushing the enriched record securely back to the frontend without any external copy-pasting required.
### 6. Job Seeker Area
- **Job Profiles:** Define high-level career goals (e.g., "Senior Software Engineer") with target industries, salaries, and rich Markdown-rendered descriptions. The most recent profile is auto-selected on load.
- **Target Organizations:** Link existing Organizations to a Job Profile as a `JobOpportunity`, moving them through a tracked pipeline (Target -> Applied -> Interviewing -> Offered).
- **Communication Logging:** Automatically import mock Gmail communications to log interactions with recruiters at target companies, storing links to locally hosted documents.

## How to Use the App

1. **Navigation:** Use the top navigation bar to switch between the main functional areas: **Graph Hub**, **People**, **Organizations**, and **Relationship Types**.
2. **Setup Types:** Start by navigating to **Relationship Types** to define the kinds of connections you want to track in your network.
3. **Add Entities:** Navigate to the **People** and **Organizations** tabs to populate your database with nodes. You can also define an organization's parent to build hierarchies.
4. **Create Relationships:** Within a Person or Organization's detail view, use the "Add Relationship" feature to link them to other entities in the system. The available relationship types will filter dynamically based on the entities being connected (e.g., Personal types for Person-to-Person).
5. **Analyze the Graph:** Return to the **Graph Hub** to see your interconnected data. Use the filter toggles on the left sidebar to isolate specific parts of your network or search for specific nodes.
