# 🧭 BrowserMind — Autonomous AI Browser Agent

> **Autonomous AI Browser Agent for Intelligent Web Navigation, Research & Task Execution**

BrowserMind is an AI-powered autonomous browser agent that understands a user's high-level goal, breaks it into smaller tasks, controls a web browser, gathers and analyzes information, verifies important findings across sources, and produces a final verified report. Unlike a conventional chatbot, the system is designed to decide what browser actions are needed rather than requiring the user to provide every step.

---

## 🌟 Core Workflow

```
USER TASK → UNDERSTAND GOAL → PLAN → BROWSE → OBSERVE → REASON → VERIFY → NEXT ACTION → COMPLETE → FINAL RESULT
```

---

## 🚀 Key Features

1. **Natural-Language Task Input**: Accepts complex high-level goals instead of rigid, low-level commands.
2. **Autonomous Multi-Agent Planning**: Decomposes goals into a dynamic DAG/step plan across specialized agents (Planner 🧠, Researcher 🌐, Verifier ⚖️, Reporter 📝).
3. **Browser Automation Layer**: Real Playwright Chromium integration with headless/headed execution, scrolling, typing, clicking, and live base64 viewport streaming.
4. **Web Information Extraction**: Collects structured text, tables, deep links, and metadata.
5. **Multi-Source Fact Verification**: Cross-checks facts across independent sources, detects conflicting claims, and computes Evidence Confidence Scores (0-100%).
6. **Task & Vector Memory**: In-memory TF-IDF semantic vector embeddings, visited domains audit log, and entity key-value store.
7. **Human-in-the-Loop Safety Layer**: Intercepts high-risk or sensitive actions (payments, logins, mutations) with real-time approval modals and user steering.
8. **Final Report Studio**: Multi-format reporting (Executive Summary, Comparative Matrix, Conflicting Claims, Verified Citations, 1-Click PDF, Markdown, JSON exports).
9. **7 Pre-Configured Use Case Templates**:
   - 🔬 Technical Research Agent (IoT, frameworks, platform comparisons)
   - 🛍️ Shopping & Product Research (laptops, gear, price & spec matrix)
   - 💼 Job Market & Career Research (roles, requirements, compensation)
   - 🎓 Academic & Literature Research (arXiv papers, literature, citations)
   - 🐙 GitHub & Open-Source Research (repositories, architecture, stars)
   - ✈️ Travel & Itinerary Research (destinations, itineraries, hotels)
   - 📊 Competitive Intelligence (competitors, pricing, market moves)

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Tailwind CSS v4, Lucide Icons, Vite |
| **Backend** | Python 3.9+, FastAPI, WebSockets, AsyncIO |
| **Browser Automation** | Playwright + Chromium (with resilient HTTP fallback) |
| **Multi-Agent Orchestration** | Autonomous Planner, Researcher, Verifier, Reporter Engine |
| **LLM Reasoning** | Pluggable (OpenAI GPT-4o, Google Gemini, Anthropic Claude, Ollama, Heuristic Engine) |
| **Verification Engine** | Cross-Source Corroboration & Discrepancy Detection |
| **Memory** | In-Memory TF-IDF Semantic Embeddings & Entity Store |
| **Reporting & Export** | jsPDF, jsPDF-AutoTable, Markdown, JSON |

---

## ⚡ Quick Start & Installation

### 1. Backend Setup

```bash
cd backend
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browser
playwright install chromium

# Launch FastAPI backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend server runs on `http://localhost:8000`. API docs are available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend dashboard runs on `http://localhost:3000`.

---

## 🧪 Testing

Run the automated backend test suite:

```bash
# Run unit & component tests
backend/venv/bin/python3 backend/tests/test_browsermind.py

# Run full end-to-end agent loop test
backend/venv/bin/python3 backend/tests/test_e2e_agent.py
```

---

## 🔒 Safety & Governance

BrowserMind implements 3 configurable safety levels:
- **Strict**: Requires human confirmation for all interactive DOM clicks, form submissions, and external actions.
- **Balanced (Default)**: Automatically approves read-only navigation while intercepting authentication, payment gateways, and destructive operations.
- **Autonomous**: Maximizes speed for purely non-destructive research tasks.

---

## 📄 License

MIT License.
