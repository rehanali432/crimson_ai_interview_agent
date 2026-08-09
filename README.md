<div align="center">

# 🔴 CRIMSON AI

### Intelligent AI-Powered Technical Interview Agent

[![Built with Node.js](https://img.shields.io/badge/Backend-Node.js%2022-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20+%20pgvector-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![LLM](https://img.shields.io/badge/LLM-OpenRouter%20API-FF6600?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai/)

> An adaptive, conversational AI interviewer that conducts personalized technical assessments using a RAG (Retrieval-Augmented Generation) pipeline — built for the **ABTalks Vibe Coding Hackathon**.

</div>

---

## 📌 Overview

**Crimson AI** is NOT a quiz engine. It is an **intelligent technical interviewer** that simulates real-world interview dynamics:

- Asks adaptive follow-up questions based on your previous answers
- Retrieves relevant curriculum topics from a 31-day AI training program using vector similarity search
- Evaluates candidate responses in real-time and adjusts difficulty
- Detects gibberish/irrelevant answers and calls them out
- Generates a comprehensive assessment report with confidence score, strengths, gaps, and actionable next steps

The system evaluates candidates who have completed a **31-day AI/ML curriculum** covering 8 modules from Environment Setup to Production & Capstone.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **RAG Pipeline** | 5-module engine: Curriculum Retriever → Candidate Analyzer → Prompt Generator → LLM → Answer Evaluator |
| 🎯 **Adaptive Difficulty** | Questions scale from Level 1 (basics) to Level 5 (expert) based on candidate strength |
| 💬 **Conversational Flow** | Natural multi-turn interview with context memory — not a static Q&A |
| 🔍 **Vector Search** | 217 curriculum embeddings stored in pgvector for semantic retrieval |
| 🛡️ **Gibberish Detection** | Identifies nonsense/irrelevant answers and provides appropriate feedback |
| 📊 **Dynamic Scoring** | Transcript-based confidence scoring from 1% to 98% based on actual answer quality |
| 📝 **Assessment Reports** | Detailed feedback with strengths, knowledge gaps, and personalized study plan |
| 👥 **20 Candidate Profiles** | Pre-loaded candidates with unique mission histories and performance data |
| ⚡ **LLM Fallback Cascade** | Primary: gpt-oss-20b → Fallback: Gemini 2.5 Flash → GPT-4o-mini → Llama 3.3 70B |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│  Landing Page → Candidate Selection → Interview → Feedback     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST API
┌──────────────────────────────▼──────────────────────────────────┐
│                     BACKEND (Node.js + Express)                 │
│                                                                 │
│  ┌─────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │  Interview   │  │  Session Manager │  │  Context Memory   │  │
│  │  Controller  │──│  (In-Memory)     │──│  (Turn History)   │  │
│  └──────┬──────┘  └──────────────────┘  └───────────────────┘  │
│         │                                                       │
│  ┌──────▼──────────────────── RAG ENGINE ──────────────────┐   │
│  │                                                          │   │
│  │  1. Curriculum Retriever  ──→  pgvector similarity search│   │
│  │  2. Candidate Analyzer    ──→  strength/weakness profiling│  │
│  │  3. Prompt Generator      ──→  dynamic system prompts    │   │
│  │  4. Question Engine (LLM) ──→  OpenRouter API call       │   │
│  │  5. Feedback Engine       ──→  transcript-based scoring  │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│              NEON PostgreSQL + pgvector Extension                │
│  • curriculum_embeddings (217 vectors, 1536-dim)                │
│  • Semantic similarity search via cosine distance               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | Component-based UI framework |
| **Vite 6** | Lightning-fast build tool & dev server |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **Framer Motion** | Smooth animations & transitions |
| **Lucide React** | Modern icon library |
| **React Router v7** | Client-side routing |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js 22** | Server runtime (ES Modules) |
| **Express 4** | HTTP server framework |
| **Drizzle ORM** | Type-safe database queries & migrations |
| **OpenAI SDK** | Embedding generation (text-embedding-3-small) |
| **Winston** | Structured JSON logging |
| **CORS + Helmet** | Security middleware |

### Database & AI
| Technology | Purpose |
|-----------|---------|
| **Neon PostgreSQL** | Serverless Postgres database |
| **pgvector** | Vector similarity search extension |
| **OpenRouter API** | LLM access (multi-model fallback) |
| **text-embedding-3-small** | 1536-dimensional text embeddings |

---

## 📁 Project Structure

```
crimson_ai_interview_agent/
│
├── backend/
│   ├── src/
│   │   ├── app.js                    # Express server entry point
│   │   ├── controllers/
│   │   │   └── interviewController.js # Request handler for /api/interview
│   │   ├── data/
│   │   │   ├── curriculum.json        # 31-day AI curriculum (8 modules, 31 days)
│   │   │   └── candidates.json        # 20 candidate profiles with mission history
│   │   ├── db/
│   │   │   ├── schema.js              # Drizzle ORM schema (pgvector columns)
│   │   │   ├── index.js               # Database connection pool
│   │   │   └── seed.js                # Seed curriculum embeddings into pgvector
│   │   ├── memory/
│   │   │   ├── sessionManager.js      # In-memory interview session store
│   │   │   └── contextMemory.js       # Turn-by-turn conversation context
│   │   ├── middleware/
│   │   │   ├── errorHandler.js        # Global error handling middleware
│   │   │   └── requestLogger.js       # HTTP request logging (Winston)
│   │   ├── rag/                       # ⭐ Core RAG Engine (5 modules)
│   │   │   ├── curriculumRetriever.js # Vector similarity search against pgvector
│   │   │   ├── candidateAnalyzer.js   # Candidate strength/weakness profiling
│   │   │   ├── promptGenerator.js     # Dynamic system prompt construction
│   │   │   ├── questionEngine.js      # LLM call orchestration via OpenRouter
│   │   │   └── feedbackEngine.js      # Transcript evaluation & scoring
│   │   ├── routes/
│   │   │   └── interviewRoutes.js     # API route definitions
│   │   ├── services/
│   │   │   └── interviewService.js    # Interview orchestration logic
│   │   └── utils/
│   │       ├── config.js              # Environment variable loader
│   │       └── logger.js              # Winston logger configuration
│   ├── .env.example                   # Environment variable template
│   ├── drizzle.config.js              # Drizzle ORM configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Root component with React Router
│   │   ├── main.jsx                   # Vite entry point
│   │   ├── index.css                  # Global styles (black & white theme)
│   │   ├── components/
│   │   │   ├── CandidateDetailModal.jsx  # Candidate profile modal
│   │   │   ├── MessageBubble.jsx         # Chat message component
│   │   │   ├── ProgressBar.jsx           # Interview progress indicator
│   │   │   └── TypingIndicator.jsx       # AI thinking/processing indicator
│   │   ├── pages/
│   │   │   ├── Landing.jsx            # Home page with candidate selection
│   │   │   ├── Interview.jsx          # Live interview chat interface
│   │   │   ├── Feedback.jsx           # Assessment report & scoring page
│   │   │   └── NotFound.jsx           # 404 page
│   │   └── services/
│   │       └── api.js                 # Axios API client
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── docs/                              # Architecture & documentation
│   ├── architecture.md
│   └── technical-spec.md
├── AI_CONTEXT_LOG.md                  # Development session activity log
├── PROMPTS.md                         # Prompt history & changelog
└── README.md                         # ← You are here
```

---

## 📚 Curriculum Coverage

The AI interviewer draws questions from a **31-day AI/ML training program** with **8 modules**:

| # | Module | Days | Topics Covered |
|---|--------|------|----------------|
| 1 | **Environment & Tooling** | Day 1–3 | VS Code, Python, Git, Jupyter, Google Colab |
| 2 | **Data Foundations** | Day 4–6 | Pandas, NumPy, Data Cleaning, EDA, Visualization |
| 3 | **Embeddings & Vector Search** | Day 7–10 | Word2Vec, Sentence Transformers, FAISS, ChromaDB, pgvector |
| 4 | **LLM Core, Prompting & Fine-Tuning** | Day 11–15 | Transformer Architecture, Tokenization, Prompt Engineering, LoRA, QLoRA |
| 5 | **Chatbot Application Build** | Day 16–20 | LangChain, Conversation Memory, RAG Pipeline, Streamlit UI |
| 6 | **Agentic AI & MCP** | Day 21–24 | AI Agents, Tool Use, Multi-Agent Systems, MCP Protocol |
| 7 | **Evaluation, Security & Deployment** | Day 25–28 | LLM Evaluation, Red Teaming, Guardrails, Docker, CI/CD |
| 8 | **Production & Capstone** | Day 29–31 | Scaling, Monitoring, Capstone Project |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 22 LTS)
- **npm** 9+
- **Neon PostgreSQL** account ([neon.tech](https://neon.tech)) with pgvector extension enabled
- **OpenRouter API Key** ([openrouter.ai](https://openrouter.ai))

### 1. Clone the Repository

```bash
git clone https://github.com/rehanali432/crimson_ai_interview_agent.git
cd crimson_ai_interview_agent
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=3001
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
OPENROUTER_MODEL=openai/gpt-oss-20b
EMBEDDING_MODEL=text-embedding-3-small
NODE_ENV=development
```

Install dependencies and seed the database:

```bash
npm install
npm run db:migrate    # Run Drizzle migrations
npm run db:seed       # Seed 217 curriculum embeddings into pgvector
npm run dev           # Start backend on http://localhost:3001
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev           # Start frontend on http://localhost:5173
```

### 4. Open the App

Navigate to **http://localhost:5173** in your browser.

---

## 🔌 API Endpoints

### Interview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/interview` | Start a new interview or send a message in an ongoing session |

**Request Body (Start Interview):**
```json
{
  "sessionId": "unique-session-id",
  "candidate": {
    "member": {
      "id": "CAND-001",
      "name": "John Doe",
      "jobRole": "ML Engineer",
      "yearsExperience": 3,
      "education": "BS Computer Science",
      "status": "COMPLETED"
    },
    "missions": [
      { "day": 7, "title": "Embeddings Explained", "passed": true, "attempts": 1 }
    ]
  }
}
```

**Request Body (Continue Interview):**
```json
{
  "sessionId": "unique-session-id",
  "message": "Your answer to the interviewer's question..."
}
```

**Response (During Interview):**
```json
{
  "reply": "AI interviewer's next question or response...",
  "done": false
}
```

**Response (Interview Complete):**
```json
{
  "reply": "Thank you for the interview...",
  "done": true,
  "feedback": {
    "summary": "Detailed performance summary...",
    "confidenceScore": 0.72,
    "strengths": ["Strength 1", "Strength 2"],
    "gaps": ["Gap 1", "Gap 2"],
    "next": ["Recommendation 1", "Recommendation 2"],
    "daysToRevisit": [7, 11, 15]
  }
}
```

### Candidates

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/candidates` | Returns all 20 candidate profiles |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check — returns server status |

---

## 🧠 How the RAG Engine Works

```
User selects candidate → Start Interview
        │
        ▼
┌─ 1. CURRICULUM RETRIEVER ─────────────────────────┐
│  • Queries pgvector for candidate's completed days │
│  • Returns top-K relevant curriculum chunks         │
│  • Cosine similarity search on 1536-dim embeddings  │
└────────────────────────┬───────────────────────────┘
                         ▼
┌─ 2. CANDIDATE ANALYZER ───────────────────────────┐
│  • Analyzes mission history (passed/failed/skipped)│
│  • Calculates overall strength: weak/moderate/strong│
│  • Determines recommended difficulty level (1-5)    │
└────────────────────────┬───────────────────────────┘
                         ▼
┌─ 3. PROMPT GENERATOR ─────────────────────────────┐
│  • Builds dynamic system prompt with:              │
│    - Candidate profile & strength analysis          │
│    - Retrieved curriculum context                   │
│    - Conversation history (previous Q&A turns)     │
│    - Grading rubric for answer evaluation          │
└────────────────────────┬───────────────────────────┘
                         ▼
┌─ 4. QUESTION ENGINE (LLM) ────────────────────────┐
│  • Sends prompt to OpenRouter API                  │
│  • Model cascade: gpt-oss-20b → Gemini → GPT-4o-mini│
│  • Returns adaptive follow-up question              │
└────────────────────────┬───────────────────────────┘
                         ▼
┌─ 5. FEEDBACK ENGINE ──────────────────────────────┐
│  • After 5-7 turns, generates assessment report    │
│  • Reads full transcript for context-aware scoring │
│  • Dynamic confidence score (1% – 98%)             │
│  • Identifies strengths, gaps & next steps         │
└────────────────────────────────────────────────────┘
```

---

## 🎨 Design System

- **Theme**: Monochrome black (`#080808`) and white
- **Fonts**: Montserrat, Poppins, Outfit, Geologica
- **Animations**: Framer Motion (fade-in, slide-up, scale transitions)
- **UI Style**: Minimal, clean, modern — glassmorphism borders with `border-white/10`

---

## 🧪 Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Branch Naming Convention
- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation updates
- `update/` — General updates

---

## 👥 Team

Built by **Rehan Ali** and team for the **ABTalks Vibe Coding Hackathon**.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ using RAG, pgvector & OpenRouter**

</div>
