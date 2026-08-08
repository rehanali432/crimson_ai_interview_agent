# AI Context Log

> This log maintains development context across coding sessions. Each session appends its decisions, changes, and next steps so any AI model can pick up where the last one left off.

---

## Session 1 — 2026-08-07 (23:30 IST → 23:55 IST)

**AI Model:** Claude Opus 4.6 (Thinking)  
**Phase:** Phase 1 — Architecture & Foundation  
**Status:** ✅ COMPLETED

---

### Architecture Decisions Made

1. **Monorepo structure** — `/frontend` (React+Vite) and `/backend` (Express) in a single repo
2. **Vector DB** — pgvector on Neon PostgreSQL (hackathon requirement). Curriculum chunks embedded with `text-embedding-3-small` (1536 dimensions) and stored in `curriculum_embeddings` table
3. **LLM** — OpenAI `gpt-oss-20b` via OpenRouter API (NOT local — deployment compatibility, no GPU dependency)
4. **RAG Pipeline** — Candidate Analyzer → Curriculum Retriever (pgvector similarity search) → Prompt Generator → LLM → Answer Evaluator → Memory Update
5. **Database** — Neon PostgreSQL with Drizzle ORM — 5 tables: `sessions`, `messages`, `feedback`, `retrieval_logs`, `curriculum_embeddings`
6. **No auth** — Per hackathon spec, no JWT/authentication required
7. **ES Modules** — Backend uses `"type": "module"` in package.json for native ESM imports
8. **Tailwind CSS v4** — Using `@tailwindcss/vite` plugin (not PostCSS), with `@theme` block for design tokens
9. **Vite proxy** — Frontend dev server proxies `/api` to `http://localhost:3001` to avoid CORS issues
10. **Stateless server** — All interview state persisted in PostgreSQL via sessionId; no in-memory state

---

### Activity Log (Chronological)

#### Step 1 — Research & Data Analysis
- Located `curriculum.json` at `C:\Users\rehan\OneDrive\Documents\curriculum.json`
- Located `candidates.json` at `C:\Users\rehan\OneDrive\Documents\candidates.json`
- Located `technical-spec.md` at `C:\Users\rehan\OneDrive\Documents\technical-spec.md`
- Read and analyzed all three files:
  - **curriculum.json**: 31-day AI cohort, 8 modules (Environment & Tooling → Production & Capstone). Each day has `title`, `type`, `tools[]`, `objectives[]`
  - **candidates.json**: 20 candidates (CAND-001 to CAND-020). Each has `member` profile + `missions[]` with `passed/failed/skipped` + `attempts` count + `signals` (commitDays, missionsCompleted, missionsFirstTry)
  - **technical-spec.md**: Single `POST /api/interview` endpoint. Request: `{sessionId, candidate?}` (start) or `{sessionId, message}` (turn). Response: `{reply, done, feedback?}`

#### Step 2 — Created Implementation Plan (artifact)
- Full architecture with Mermaid diagrams
- RAG pipeline design
- Database schema (5 tables)
- Dependency lists
- User approved with 2 changes: (1) must use vector DB, (2) use gpt-oss-20b via OpenRouter API

#### Step 3 — Root Files Created
1. `/.gitignore` — node_modules, .env, dist, IDE files, logs
2. `/README.md` — Project overview, tech stack table, quick start, API reference
3. `/AI_CONTEXT_LOG.md` — This file (initial version)
4. `/PROMPTS.md` — Hackathon prompt log (2 entries)

#### Step 4 — Backend Foundation Created (in order)
5. `/backend/package.json` — ES module, dependencies: express, cors, dotenv, langchain, @langchain/openai, @langchain/core, openai, drizzle-orm, @neondatabase/serverless, uuid, zod, morgan, helmet, compression. DevDeps: drizzle-kit, nodemon
6. `/backend/.env` — DATABASE_URL (Neon), OPENROUTER_API_KEY, OPENROUTER_BASE_URL, OPENROUTER_MODEL=openai/gpt-oss-20b, EMBEDDING_MODEL=text-embedding-3-small
7. `/backend/.env.example` — Same as .env but with placeholder values (no secrets)
8. `/backend/src/utils/config.js` — Centralized config loader. Validates required vars. Interview settings: minQuestions=8, maxQuestions=12, minCurriculumDays=4, defaultDifficulty=3
9. `/backend/src/utils/logger.js` — Structured JSON logger. Levels: error/warn/info/debug. Debug only in dev. Outputs timestamp + level + message + meta
10. `/backend/src/db/schema.js` — Drizzle ORM schema with 5 tables:
    - `sessions` — id, session_id (unique), candidate_id, candidate_name, candidate_data (jsonb), status, difficulty_level, topics_covered (jsonb), questions_asked, current_phase, started_at, completed_at
    - `messages` — id, session_id (indexed), role, content, question_number, curriculum_day, metadata (jsonb)
    - `feedback` — id, session_id (unique), summary, strengths (jsonb), gaps (jsonb), next_steps (jsonb), confidence_score, days_to_revisit (jsonb), raw_llm_response
    - `retrieval_logs` — id, session_id (indexed), query_type, retrieved_data (jsonb), relevance_score
    - `curriculum_embeddings` — id, day, title, chunk_type, content, module_number, module_name, day_type, embedding (vector 1536), metadata (jsonb)
11. `/backend/src/db/index.js` — Neon HTTP driver connection. Exports `db` (Drizzle instance), `sql` (raw), `testConnection()`
12. `/backend/src/db/migrate.js` — Raw SQL migration runner (Neon HTTP driver doesn't support Drizzle migrator). Creates pgvector extension + all 5 tables + indexes
13. `/backend/drizzle.config.js` — Drizzle Kit config pointing to Neon
14. `/backend/src/middleware/errorHandler.js` — Global error handler (JSON response, stack trace in dev only) + 404 handler
15. `/backend/src/middleware/requestLogger.js` — Logs method, path, status, duration for every request
16. `/backend/src/controllers/interviewController.js` — Stub controller: validates sessionId, returns welcome message (start) or placeholder (conversation turn)
17. `/backend/src/routes/interviewRoutes.js` — `POST /interview` → `handleInterview` controller
18. `/backend/src/app.js` — Express server: helmet, cors, compression, JSON parser (10mb), request logger, health check (`GET /api/health`), interview routes, error handlers. Starts on configured port

#### Step 5 — Data Files Copied
19. `/backend/src/data/curriculum.json` — Copied from `C:\Users\rehan\OneDrive\Documents\`
20. `/backend/src/data/candidates.json` — Copied from `C:\Users\rehan\OneDrive\Documents\`

#### Step 6 — Empty Directories Created
- `/docs/`
- `/prompts/`
- `/logs/.gitkeep`
- `/backend/src/services/`
- `/backend/src/rag/`
- `/backend/src/memory/`
- `/backend/src/prompts/`

#### Step 7 — Backend npm install
- Ran `npm install` in `/backend`
- 197 packages installed successfully
- Warnings: deprecated uuid@10 (non-breaking), deprecated node-domexception (non-breaking)

#### Step 8 — Frontend Scaffolded
- Ran `npx -y create-vite@latest frontend --template react --no-interactive`
- Scaffolded React project in `/frontend`
- Installed app dependencies: `react-router-dom`, `framer-motion`, `lucide-react`, `axios`, `react-hook-form`, `zod`, `@hookform/resolvers`, `react-markdown`
- Installed dev dependencies: `tailwindcss@4`, `@tailwindcss/vite@4`
- Had to reinstall `lucide-react@latest` due to tar extraction issue during parallel install

#### Step 9 — Frontend Configuration
21. `/frontend/vite.config.js` — Added `@tailwindcss/vite` plugin + API proxy (`/api` → `localhost:3001`)
22. `/frontend/src/index.css` — Complete CSS design system:
    - Google Fonts (Poppins, Outfit, Montserrat)
    - `@theme` block with color tokens (black/white/gray palette)
    - Glass effect classes (`.glass`, `.glass-card`)
    - Custom scrollbar (thin, dark)
    - Keyframe animations (fadeIn, slideUp, pulse-dot, gradient-shift)
    - **Fixed:** Moved `@import url(fonts)` before `@import "tailwindcss"` (CSS @import ordering rule)
23. `/frontend/src/App.jsx` — React Router with 4 routes: `/` (Landing), `/interview` + `/interview/:sessionId`, `/feedback/:sessionId`, `*` (404)
24. `/frontend/src/pages/Landing.jsx` — Hero section with badge, large heading ("Interview Intelligence"), CTA button, 3 feature cards (glass-card) with Framer Motion animations
25. `/frontend/src/pages/Interview.jsx` — Stub placeholder
26. `/frontend/src/pages/Feedback.jsx` — Stub placeholder
27. `/frontend/src/pages/NotFound.jsx` — Animated 404 with "Back to Home" button
28. `/frontend/src/services/api.js` — Axios instance (baseURL: `/api`, 30s timeout). Exports `startInterview()`, `sendMessage()`, `checkHealth()`
- Removed default Vite files: `App.css`, `assets/`

#### Step 10 — Documentation
29. `/docs/architecture.md` — System architecture diagram, database table summary, key design decisions

#### Step 11 — Database Migration
- Ran `node src/db/migrate.js` in `/backend`
- pgvector extension enabled ✅
- Table created: sessions ✅
- Table created: messages ✅
- Table created: feedback ✅
- Table created: retrieval_logs ✅
- Table created: curriculum_embeddings ✅

#### Step 12 — Verification Tests
- `npm run dev` (backend) — Server started on port 3001 ✅
- `GET http://localhost:3001/api/health` → `{ status: "healthy", database: "connected" }` ✅
- `POST http://localhost:3001/api/interview` with `{sessionId: "test-001", candidate: {member: {id: "CAND-001", name: "Sarah Johnson"}}}` → `{ reply: "Welcome, Sarah Johnson...", done: false }` ✅
- `npm run dev` (frontend) — Vite dev server on port 5173 ✅
- Proxy test: `GET http://localhost:5173/api/health` → proxied to backend ✅

---

### Files Created (Total: 29 files)

```
Root (4):
├── .gitignore
├── README.md
├── AI_CONTEXT_LOG.md
├── PROMPTS.md

Backend (18):
├── backend/package.json
├── backend/.env
├── backend/.env.example
├── backend/drizzle.config.js
├── backend/src/app.js
├── backend/src/utils/config.js
├── backend/src/utils/logger.js
├── backend/src/db/schema.js
├── backend/src/db/index.js
├── backend/src/db/migrate.js
├── backend/src/middleware/errorHandler.js
├── backend/src/middleware/requestLogger.js
├── backend/src/controllers/interviewController.js
├── backend/src/routes/interviewRoutes.js
├── backend/src/data/curriculum.json
├── backend/src/data/candidates.json
├── backend/src/services/ (empty)
├── backend/src/rag/ (empty)
├── backend/src/memory/ (empty)
├── backend/src/prompts/ (empty)

Frontend (8):
├── frontend/vite.config.js (modified)
├── frontend/src/index.css (replaced)
├── frontend/src/App.jsx (replaced)
├── frontend/src/pages/Landing.jsx
├── frontend/src/pages/Interview.jsx
├── frontend/src/pages/Feedback.jsx
├── frontend/src/pages/NotFound.jsx
├── frontend/src/services/api.js

Docs (1):
├── docs/architecture.md
├── logs/.gitkeep
├── prompts/ (empty)
```

---

### Completed Tasks
- [x] Phase 1: Architecture & Foundation ✅
- [x] Phase 2: Backend Setup ✅
- [x] Phase 3: RAG Engine ✅

### Pending Tasks
- [x] Phase 4: Interview state management — Memory, context, difficulty adaptation (MOSTLY DONE — merged into Phase 2/3) ✅
- [x] Phase 5: Frontend — Landing page polish, interview chat UI, feedback page, animations ✅
- [x] Phase 6: Integration — Frontend ↔ Backend, loading states, error handling ✅

### Pending Tasks
- [ ] Phase 7: Testing — Edge cases, weak/strong answers, topic coverage
- [ ] Phase 8: Deployment — Frontend, Backend, env vars, README

### Current Project Status
**Phase 5 & 6 COMPLETED → Phase 7 starting**

### Next Prompt Recommendation
"Begin Phase 7: Testing — Ensure robust error handling, test with missing values, verify full interview completion and feedback formatting."

---
---

## Session 9 — 2026-08-08 (15:38 IST → 15:40 IST)

**AI Model:** Gemini 3.6 Flash (High)  
**Phase:** Frontend Black & White Theme Polish & Component Refinements  
**Status:** ✅ COMPLETED

---

### Activity Log (Chronological)

#### Step 1 — Typing Indicator Black & White Overhaul (`TypingIndicator.jsx`)
- Converted container styling to clean black & white monochrome (`bg-slate-900 border border-slate-800 text-slate-200`).
- Removed all step icons (`Database`, `Brain`, `Cpu`, `Sparkles`) from step progress text as requested.
- Rendered white pulsing status dots and monochrome bot avatar.

#### Step 2 — Removed Textarea Focus White Outline Box (`Interview.jsx` & `index.css`)
- Added `border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent shadow-none appearance-none` and inline `outline: 'none', boxShadow: 'none'` to composer textarea in `Interview.jsx`.
- Added global `textarea:focus, textarea:focus-visible` outline resets in `index.css` to eliminate default browser white focus rings.

#### Step 3 — Updated Brand Logo (`Landing.jsx`)
- Replaced brand logo icon with `<img width="24" height="24" src="https://img.icons8.com/fluency-systems-regular/48/circled-c.png" alt="circled-c" className="invert filter brightness-200" />` rendered in pure white.

---
---

## Session 8 — 2026-08-08 (15:36 IST → 15:37 IST)

**AI Model:** Gemini 3.6 Flash (High)  
**Phase:** GitHub Repository Push  
**Status:** ✅ COMPLETED

---

### Activity Log (Chronological)

#### Step 1 — Git Repository Initialization & Security Check
- Initialized local git repository (`git init`).
- Verified `.gitignore` configuration — ensured `.env`, `node_modules/`, and build artifacts are strictly ignored.
- Created `backend/.env.example` template for deployment security.

#### Step 2 — Initial Commit
- Staged all 52 project files (`git add .`).
- Created commit: `feat: complete Crimson AI Technical Interview Agent (RAG + pgvector + full UI revamp)`.

#### Step 3 — Pushed to Remote GitHub Repository
- Linked remote origin: `https://github.com/rehanali432/crimson_ai_interview_agent.git`.
- Set default branch: `main`.
- Successfully pushed all code to GitHub (`git push -u origin main`). ✅

---
---

## Session 7 — 2026-08-08 (15:25 IST → 15:35 IST)

**AI Model:** Gemini 3.6 Flash (High)  
**Phase:** Greeting Flow, Score Passing Fix & Feedback UI Alert  
**Status:** ✅ COMPLETED

---

### Activity Log (Chronological)

#### Step 1 — Fixed Confidence Score Passing (`interviewService.js`)
- Fixed root cause of 50% score bug: `endInterview` was omitting `confidenceScore` and `daysToRevisit` from the returned `feedback` object, causing `Feedback.jsx` to fall back to `0.5` (50%).
- Updated `endInterview` to pass `confidenceScore: feedback.confidenceScore` and `daysToRevisit: feedback.daysToRevisit`.
- Now correctly displays **3%** score when answers are gibberish.

#### Step 2 — Initial Greeting + Question 1 Combination (`interviewService.js` & `promptGenerator.js`)
- Updated `startInterview` to immediately generate **Question 1** as part of the initial welcome message (*"Welcome Emily... Question 1: How would you..."*).
- Eliminates awkward "hello let's begin" confusion when the candidate enters the interview room.
- Updated `promptGenerator.js` system prompt to recognize polite greetings/acknowledgments ("hello", "ready", "let's begin") gracefully without penalizing them or calling them gibberish.

#### Step 3 — Feedback Strengths Card Alert (`Feedback.jsx`)
- Updated `Feedback.jsx` so that if no valid technical answers were provided (or strengths contains "Unable to demonstrate..."), it renders a clear Alert badge (*"No valid technical answers were provided during this interview session. Zero technical strengths demonstrated."*) instead of displaying a green checkmark.

#### Step 4 — Empirical Verification
- **Test 1**: Initial interview start (`fix-test-102`) returns Welcome Greeting + Question 1 immediately.
- **Test 2**: Candidate replying `"hello ready"` is greeted politely and presented with the technical question.
- **Test 3**: Completed interview session with gibberish answers (`fix-test-102`).
  - `confidenceScore` returned as `0.03` (**3%**).
  - Feedback UI displays **3%** confidence badge and Amber Alert for Demonstrated Strengths. ✅

---
---

## Session 6 — 2026-08-08 (15:10 IST → 15:20 IST)

**AI Model:** Gemini 3.6 Flash (High)  
**Phase:** Strict Response Evaluation & Transcript Confidence Scoring  
**Status:** ✅ COMPLETED

---

### Activity Log (Chronological)

#### Step 1 — Gibberish & Irrelevant Answer Detection (`promptGenerator.js` & `interviewService.js`)
- Updated `buildInterviewerSystemPrompt()` and `buildQuestionPrompt()` with a mandatory **Answer Evaluation Rule**:
  - The AI interviewer inspects the candidate's last answer against the question asked.
  - If the candidate provides gibberish (e.g. `lol`, `sfsfhs`), nonsense, evasive, or incorrect answers, the AI explicitly calls it out in its response (*"That response appears to be gibberish and does not answer the technical question I asked..."*).
  - Automatically drops difficulty level to 1 (`probe_fundamentals` / `follow_up`) in `interviewService.js`.

#### Step 2 — Transcript-Based Confidence Scoring (`feedbackEngine.js`)
- Created `evaluateTranscriptQuality(fullHistory)` in `feedbackEngine.js`.
- If candidate provides gibberish or non-technical answers for all/most questions during the session:
  - **Confidence Score is strictly capped at < 5% (0.03 / 3%)**.
  - **Strengths** are updated to: `["Unable to demonstrate technical competence during the interview session"]`.
  - **Gaps** list all tested topics as major gaps.
  - **Summary** reflects the actual transcript performance honestly.

#### Step 3 — Empirical Verification
- **Test 1**: Sent gibberish `"lol sfsfhs"` during an interview turn.
  - **AI Result**: *"That last response appears to be gibberish and does not address the technical question I asked. Can you explain the typical process of converting a paragraph into an embedding..."* ✅
- **Test 2**: Completed interview with 100% gibberish responses (`eval-test-999`).
  - **Feedback Result**: `confidenceScore: 0.03` (3%), `summary: "Emily Chen provided non-technical, gibberish, or empty responses throughout the interview session. Zero technical competence was demonstrated."`, `strengths: ["Unable to demonstrate technical competence during the interview session"]`. ✅

---
---

## Session 5 — 2026-08-08 (14:35 IST → 15:05 IST)

**AI Model:** Gemini 3.6 Flash (High)  
**Phase:** UI/UX Total Revamp & Model Fallbacks  
**Status:** ✅ COMPLETED

---

### Activity Log (Chronological)

#### Step 1 — Add Curriculum Mapping to Candidate Profile (`candidateAnalyzer.js`)
- Enriched `lookupCandidate(candidateId)` and `getAllCandidates()` to map candidate mission history against `curriculum.json`.
- Calculates:
  - **Modules Breakdown**: Covered vs total days across all 8 modules.
  - **Daily Topics Breakdown**: Status of all 31 days (aced, passed, struggled, skipped, failed, unattempted).
  - **Learning Objectives**: List of concrete learning objectives achieved from passed missions.
  - **Tools Mastered**: Deduplicated set of tools/frameworks used throughout candidate's passed curriculum days.

#### Step 2 — Model Cascade Fallbacks (`questionEngine.js` & `feedbackEngine.js`)
- Implemented automatic fallback model cascade: `[OPENROUTER_MODEL, 'google/gemini-2.5-flash', 'openai/gpt-4o-mini', 'meta-llama/llama-3.3-70b-instruct']`.
- Ensures zero crash/hang if primary model is throttled or slow on OpenRouter API.

#### Step 3 — Complete Landing Page Revamp (`Landing.jsx`)
- Built a full-fledged, high-converting landing page:
  - **Navbar**: Brand Logo, Nav Links (Overview, Candidate Hub, RAG System, Curriculum, About), Hackathon Badge, CTA.
  - **Hero Section**: Gradient Typography ("The Intelligent Technical Interviewer"), Pill Badge, Subtitle, Real-time Stats Counter (217 Chunks, 20 Candidates, 31 Days).
  - **Candidate Selection Hub**: Candidate Picker Dropdown + Live Candidate Breakdown Card showing Modules Covered, Daily Topics Passed, Objectives Met, Tools Mastered Chips, and "View Detailed Breakdown" button.
  - **Candidate Detail Modal (`CandidateDetailModal.jsx`)**: Tabbed drawer displaying Program Overview, Modules Breakdown, Daily Topics status (Days 1-31), and Tools & Objectives.
  - **Engine Architecture Features**: 3 Bento cards showcasing pgvector Retrieval, Mission Analysis, and Assessment Reports.
  - **Curriculum Overview**: Grid showcasing the 8 Cohort Modules.
  - **About Section & Footer**: Tech stack badges and hackathon credits.

#### Step 4 — Chat UI & Message Bubble Overhaul (`MessageBubble.jsx` & `Interview.jsx`)
- Fixed message layout issues:
  - **Interviewer Message**: Glass container (`slate-900/90 border border-slate-800`), gradient bot avatar, role label with strategy tag (`probe_depth`, `probe_fundamentals`).
  - **Candidate Message**: High-contrast indigo gradient (`bg-gradient-to-r from-indigo-600 to-indigo-700`), crisp white legible text, user avatar.
- **Dynamic Step Progress Indicator (`TypingIndicator.jsx`)**: Displays animated cycling pipeline status updates (*"Searching vector database pgvector...", "Analyzing candidate mission history...", "Synthesizing adaptive technical question..."*).
- **Sticky Header & Fixed Bottom Input**: Sticky navbar with progress bar, fixed bottom input container with clean textarea and send button.

---
---

## Session 4 — 2026-08-08 (14:15 IST → 14:45 IST)

**AI Model:** Gemini 3.1 Pro (High)
**Phase:** Phase 5 & 6 — Frontend & Integration
**Status:** ✅ COMPLETED

---

### Activity Log (Chronological)

#### Step 1 — API Services Update
- Updated `frontend/src/services/api.js` to include `getCandidates` and `getCandidate` functions.
- Increased the request timeout to 60s to handle RAG pipeline latency.

#### Step 2 — Reusable UI Components
- Created `TypingIndicator.jsx` for showing an animated "AI is thinking" state using `framer-motion`.
- Created `MessageBubble.jsx` for rendering chat messages (distinguishing AI vs User) with markdown support via `react-markdown`.
- Created `ProgressBar.jsx` for visualizing interview progress against minimum and maximum expected questions.

#### Step 3 — Main Pages Implementation
- Built `Landing.jsx`: A polished hero section with gradient orb backgrounds, feature cards, and a candidate selection dropdown that fetches from the backend and navigates to the interview route with the selected candidate ID and a generated session ID.
- Built `Interview.jsx`: The core chat interface, complete with a persistent header showing progress, an auto-scrolling message list, animated typing indicator, error boundaries, and auto-resizing text input. Upon completion of the interview, automatically redirects to the feedback page.
- Built `Feedback.jsx`: A visually striking dashboard that displays the structured JSON feedback (score card, key strengths, areas for growth, and recommended next steps) passed via React Router state.
- Built `NotFound.jsx`: Simple 404 page for unmatched routes.

#### Step 4 — Verification
- The frontend and backend servers were started and proxying works perfectly (`/api` -> `localhost:3001`).
- Since Phase 6 consists of integration (loading states, error handling, API wiring), it was fully completed in tandem with Phase 5.
- The UI handles errors gracefully if the backend isn't available or fails to respond.

---
---

## Session 3 — 2026-08-08 (13:55 IST → 14:30 IST)

**AI Model:** Claude Opus 4.6 (Thinking)  
**Phase:** Phase 3 — RAG Engine  
**Status:** ✅ COMPLETED

---

### Activity Log (Chronological)

#### Step 1 — Verified Project Integrity
- Checked all directories and files from Phase 1 & 2 are intact
- Confirmed `backend/src/rag/` is empty (ready for Phase 3 files)
- Confirmed `interviewService.js` still has stub `generateNextQuestion()` and `generateFeedback()`

#### Step 2 — Created `backend/src/rag/candidateAnalyzer.js`
- Loads `candidates.json` at startup
- Core functions:
  - `analyzeCandidate(candidateData)` — Full profile analysis:
    - Categorizes missions into: `passedMissions`, `failedMissions`, `skippedMissions`, `struggledMissions` (passed but ≥4 attempts), `acedMissions` (passed first try)
    - Determines `overallStrength`: 'strong' (>60% first-try), 'weak' (>30% failed/skipped), 'moderate' (else)
    - Sets `recommendedDifficulty`: strong+senior→4, strong→3, weak→2, moderate→3
    - Builds `priorityTopics` list with strategies: `probe_fundamentals` (weak), `probe_depth` (strong), `intro_only` (skipped)
  - `lookupCandidate(candidateId)` — Find candidate by ID from JSON
  - `getAllCandidates()` — Returns all 20 candidates (for frontend dropdown)
  - `selectNextTopic(analysis, topicsCovered, questionsAsked)` — Scoring algorithm:
    - High priority (weak topics) → score 100 - questionsAsked*5 (ask early)
    - Medium priority (strong topics) → score 60 + questionsAsked*3 (ask later for depth)
    - Low priority (skipped topics) → score 30 (only for coverage)
    - Returns highest-scored uncovered topic

#### Step 3 — Created `backend/src/rag/curriculumRetriever.js`
- The core pgvector RAG component (hackathon requirement)
- Loads `curriculum.json` at startup
- Core functions:
  - `chunkCurriculum()` — Splits 31 days into 217 chunks:
    - **overview** chunks: "Day X: Title. Type. Module. Tools."
    - **objective** chunks: Each learning objective as a separate chunk
    - **tool** chunks: Tools and technologies used per day
  - `seedCurriculumEmbeddings()` — Idempotent seeding:
    1. Checks if already seeded (SELECT COUNT)
    2. Generates chunks (217 total)
    3. Batches of 10 → calls OpenAI `text-embedding-3-small` API
    4. INSERT each chunk with embedding vector into pgvector
    5. Total seeding time: ~45 seconds
  - `retrieveCurriculumChunks(query, limit, filters)` — pgvector cosine similarity search:
    - Generates embedding for the query
    - Runs `SELECT ... ORDER BY embedding <=> query_vector` with cosine distance
    - Supports filters: `dayNumbers`, `chunkTypes`
    - Returns chunks with similarity scores
  - `getCurriculumDay(dayNumber)` — Direct JSON lookup
  - `getModuleForDay(dayNumber)` — Maps day → module
  - `getFullDayContext(dayNumber)` — Combines JSON + module info

#### Step 4 — Created `backend/src/rag/promptGenerator.js`
- All LLM prompts for the interview system
- Prompts created:
  - `buildInterviewerSystemPrompt()` — Interviewer personality:
    - Professional, warm, rigorous
    - ONE question at a time
    - Acknowledge previous answer before asking next
    - Never reveal AI identity
    - Natural conversational transitions
    - Question types: Conceptual, Applied, Comparative, Debugging, Design, Trade-off
  - `buildQuestionPrompt({...})` — User prompt for question generation:
    - Includes: candidate profile, interview state, strategy instructions, curriculum context, retrieved chunks, recent conversation
    - Difficulty labels: 1=introductory → 5=expert
    - Strategy instructions: probe_fundamentals, probe_depth, intro_only, standard, follow_up
  - `buildFeedbackPrompt({...})` — Feedback generation prompt:
    - Full interview transcript
    - Structured JSON output: summary, strengths[], gaps[], next[], confidenceScore, daysToRevisit[]
  - `buildEvaluationPrompt(question, answer, topicContext)` — Answer scoring (1-5)

#### Step 5 — Created `backend/src/rag/questionEngine.js`
- The brain of the RAG interview system
- Full pipeline: Candidate Analysis → Topic Selection → pgvector Retrieval → LLM Generation
- Core functions:
  - `generateQuestion(sessionId, session, context, difficulty)`:
    1. Analyzes candidate via `analyzeCandidate()`
    2. Selects next topic via `selectNextTopic()`
    3. Gets full day context + pgvector chunks via `getFullDayContext()` + `retrieveCurriculumChunks()`
    4. Logs retrieval to `retrieval_logs` table
    5. Determines strategy (follow_up if last answer was weak)
    6. Builds prompt via `buildInterviewerSystemPrompt()` + `buildQuestionPrompt()`
    7. Calls LLM via OpenRouter (`callLLM()`)
    8. Returns `{ text, curriculumDays, type, strategy }`
  - `evaluateAnswer(question, answer, topicContext)` — LLM-scored 1-5 with follow-up recommendation
  - `generateWrapUpQuestion()` — Closing question when all topics covered
  - `callLLM(systemPrompt, userPrompt)` — OpenRouter API call (temperature 0.7, max_tokens 500)

#### Step 6 — Created `backend/src/rag/feedbackEngine.js`
- Generates structured interview feedback using LLM
- Core functions:
  - `generateInterviewFeedback(sessionId, session, context)`:
    1. Analyzes candidate profile
    2. Builds feedback prompt with full transcript
    3. Calls LLM (temperature 0.4 for consistency)
    4. Parses JSON response (strips markdown fences, extracts JSON)
    5. Returns structured feedback object
  - `parseFeedbackResponse(rawResponse)` — Robust JSON extraction
  - `generateFallbackFeedback(session, context, analysis)` — Heuristic fallback if LLM fails

#### Step 7 — Created `backend/src/routes/candidateRoutes.js`
- `GET /api/candidates` — List all 20 candidates (id, name, role, experience, education, missions count)
- `GET /api/candidates/:id` — Get full candidate data (member + missions + signals)

#### Step 8 — Updated `backend/src/app.js`
- Added import: `candidateRoutes` and `seedCurriculumEmbeddings`
- Added route: `app.use('/api', candidateRoutes)`
- Added async startup: Seeds curriculum embeddings on server start (non-blocking)
- Logs seeding result or continues with warning if seeding fails

#### Step 9 — Updated `backend/src/services/interviewService.js`
- Replaced stub `generateNextQuestion()` with real RAG pipeline call:
  - Calls `generateQuestion()` from questionEngine
  - Fallback: generates generic question from candidate analysis if RAG fails
- Replaced stub `generateFeedback()` with real LLM feedback:
  - Calls `generateInterviewFeedback()` from feedbackEngine
  - Fallback: heuristic feedback from candidate analysis
- Added imports: `generateQuestion`, `evaluateAnswer`, `generateInterviewFeedback`, `analyzeCandidate`, `getFullDayContext`

#### Step 10 — Verification Tests
- **Startup**: Server started on port 3001, curriculum chunked into 217 pieces
- **Seeding**: All 217 embeddings seeded into pgvector in 22 batches (~45 seconds total) ✅
- **Candidates API**: `GET /api/candidates` returns all 20 candidates ✅
- **RAG Test 1: Start Interview** — Emily Chen (CAND-003, AI Engineer, 6 yrs, 10 missions all aced)
  - Candidate analyzed: `overallStrength: "strong"`, `recommendedDifficulty: 4`
  - Welcome message personalized with role + experience + mission count ✅
- **RAG Test 2: First Question** — Sent "ready to start"
  - Topic selected: Day 7 (Embeddings Explained), strategy: `probe_depth`
  - pgvector search: 3 chunks retrieved, `topSimilarity: 0.7021`
  - LLM generated: "If you plot your embeddings with PCA and find that concepts like 'diabetes' and 'diabetes mellitus' don't cluster together, how would you investigate?" ✅
  - Pipeline time: 8,445ms
- **RAG Test 3: Strong Answer** — Sent detailed 609-char answer about embeddings
  - Topic progressed: Day 7 → Day 8 (Vector Databases Overview) ✅
  - Strategy: `probe_depth` (strong candidate → go deeper) ✅
  - LLM generated: "If you had to deploy a RAG chatbot handling ~10k concurrent queries/minute with on-prem privacy under $200/month, how would you weigh Chroma versus Pinecone?" ✅
  - Pipeline time: 6,173ms
- **Error handling**: All 400/404 errors still handled correctly ✅

---

### Files Created (Phase 3: 6 new, 2 modified)

```
New:
├── backend/src/rag/candidateAnalyzer.js   (Candidate profile + mission analysis + topic selector)
├── backend/src/rag/curriculumRetriever.js (pgvector seeding + cosine similarity retrieval)
├── backend/src/rag/promptGenerator.js     (LLM prompts — interviewer, question, feedback, evaluator)
├── backend/src/rag/questionEngine.js      (Full RAG pipeline — analyze → retrieve → generate)
├── backend/src/rag/feedbackEngine.js      (LLM-powered feedback generation + fallback)
├── backend/src/routes/candidateRoutes.js  (GET /api/candidates, GET /api/candidates/:id)

Modified:
├── backend/src/services/interviewService.js (Stub → real RAG + LLM calls)
├── backend/src/app.js (Added candidate routes + curriculum seeding on startup)
```

---

### Key Observations
1. **pgvector similarity scores are good** — Top similarity for targeted queries: 0.70-0.71 (strong semantic match)
2. **Topic progression is intelligent** — System selects topics based on candidate weakness (weak first, strong for depth later)
3. **LLM questions are natural** — No "chatbot feel", references specific tools and concepts from curriculum
4. **Strategy adaptation works** — Strong candidate gets `probe_depth` strategy, weak would get `probe_fundamentals`
5. **Pipeline performance** — First question: ~8.5s, subsequent: ~6s (mainly LLM latency from OpenRouter)
6. **Phase 4 (State Management) is already done** — contextMemory, sessionManager, difficulty adjustment were all built in Phase 2. Phase 4 is effectively complete.

---

## Session 2 — 2026-08-07 (23:55 IST → 00:00 IST)

**AI Model:** Claude Opus 4.6 (Thinking)  
**Phase:** Phase 2 — Backend Setup  
**Status:** ✅ COMPLETED

---

### Activity Log (Chronological)

#### Step 1 — Rewrote AI_CONTEXT_LOG.md
- Previous version had minimal Phase 1 log (just bullet points)
- Rewrote with full chronological activity log: every file, folder, action, and verification step documented in numbered order (29 files, 12 steps)

#### Step 2 — Created `backend/src/memory/sessionManager.js`
- All database CRUD operations for the interview system
- Functions created:
  - `createSession()` — INSERT into sessions table. Handles duplicate sessionId gracefully (returns existing session)
  - `getSession()` — SELECT by session_id, returns camelCase mapped object or null
  - `updateSessionState()` — UPDATE difficulty_level, topics_covered, questions_asked, current_phase using COALESCE for partial updates
  - `completeSession()` — SET status='completed', completed_at=NOW()
  - `saveMessage()` — INSERT into messages table (role, content, question_number, curriculum_day, metadata)
  - `getMessages()` — SELECT all messages for a session, ordered chronologically
  - `saveFeedback()` — INSERT into feedback table (summary, strengths, gaps, next_steps, confidence_score, days_to_revisit)
  - `logRetrieval()` — INSERT into retrieval_logs for RAG observability
- Uses raw SQL via Neon's tagged template syntax (`sql\`...\``) for simplicity with the HTTP driver

#### Step 3 — Created `backend/src/memory/contextMemory.js`
- Builds the context window that gets sent to the LLM
- Functions created:
  - `buildContext()` — Orchestrator: fetches all messages, extracts Q&A pairs, analyzes answers, builds recent history
  - `extractQAPairs()` — Pairs interviewer questions (by questionNumber) with candidate answers
  - `analyzeAnswers()` — Pre-LLM heuristics:
    - Counts short answers (<50 chars → likely weak)
    - Counts detailed answers (>200 chars → likely strong)
    - Detects uncertainty signals ("I don't know", "not sure", "skip", "no idea", "can't remember")
    - Tracks topics by curriculum day
    - Calculates average answer length
  - `buildRecentHistory()` — Returns last N messages in OpenAI chat format (role: assistant/user)
  - `suggestDifficultyAdjustment()` — Returns 'increase'/'decrease'/'maintain' based on:
    - If >60% detailed answers and difficulty < 5 → increase
    - If >50% short+unsure answers and difficulty > 1 → decrease
    - Otherwise → maintain

#### Step 4 — Created `backend/src/services/interviewService.js`
- Main orchestrator handling the full interview lifecycle
- Functions created:
  - `startInterview(sessionId, candidateData)`:
    1. Checks if session exists (idempotent — returns "Welcome back" if duplicate)
    2. Extracts member info (id, name, role, experience)
    3. Creates session in DB via sessionManager
    4. Builds personalized welcome message using `buildWelcomeMessage()`
    5. Saves welcome message to messages table
    6. Returns `{ reply, done: false }`
  - `processMessage(sessionId, candidateMessage)`:
    1. Gets session from DB (404 if not found, 400 if completed)
    2. Saves candidate message to messages table
    3. Builds full context via contextMemory
    4. Calculates difficulty adjustment
    5. Checks if interview should end via `shouldEndInterview()`
    6. If not ending: generates next question, updates session state, saves interviewer message
    7. If ending: calls `endInterview()`
    8. Returns `{ reply, done, feedback? }`
  - `endInterview(sessionId, session, context)`:
    1. Generates feedback (stub in Phase 2)
    2. Saves feedback to DB
    3. Marks session as completed
    4. Saves closing message
    5. Returns `{ reply, done: true, feedback: {...} }`
  - `shouldEndInterview(session, context)` — Checks:
    - Must ask ≥ minQuestions (8) before ending
    - Must cover ≥ minCurriculumDays (4) topics (unless at maxQuestions)
    - Ends at maxQuestions (12) regardless
    - Ends if both minimums met
  - `buildWelcomeMessage(candidateName, candidateData)` — Personalized greeting using:
    - Candidate name
    - Job role + years experience (if available)
    - Completed missions count (if available)
    - Sets tone: "This is a conversation, not a quiz"
  - `generateNextQuestion()` — STUB (returns placeholder, will be RAG+LLM in Phase 3)
  - `generateFeedback()` — STUB (returns placeholder, will be LLM in Phase 3)

#### Step 5 — Updated `backend/src/controllers/interviewController.js`
- Replaced stub controller with real service calls
- Now delegates to `startInterview()` and `processMessage()` from interviewService
- Controller stays thin (HTTP layer only) — validates input, calls service, returns JSON

#### Step 6 — Verification Tests
- **Test 1: Start Interview** — `POST /api/interview` with CAND-003 (Emily Chen, AI Engineer, 6 yrs, 3 missions)
  - Result: `{ reply: "Welcome, Emily Chen. I'm your technical interviewer today. I see you're working as a AI Engineer with 6 years of experience. You've completed 3 missions...", done: false }` ✅
  - Session created in Neon DB ✅
  - Welcome message saved to messages table ✅
- **Test 2: Send Answer** — Long detailed answer about embeddings (208 chars)
  - Result: Stub question returned, candidate message saved, question count incremented ✅
- **Test 3: Multiple Messages** — Sent 3 short answers (44 chars each)
  - Result: Difficulty adapted: 3 → 2 → 1 (short answers triggered decrease) ✅
  - Question counter incremented correctly: 1 → 2 → 3 → 4 ✅
- **Test 4: Idempotent Session** — Re-sent start request with same sessionId
  - Result: `"Welcome back, Emily Chen. Let's continue where we left off."` ✅ (no duplicate session created)
- **Test 5: Missing sessionId** — Empty body
  - Result: 400 Bad Request ✅
- **Test 6: Nonexistent session** — Message to unknown sessionId
  - Result: 404 Not Found ✅
- **Test 7: Invalid request** — sessionId but no candidate/message
  - Result: 400 Bad Request ✅

---

### Files Created (Phase 2: 3 new, 1 modified)

```
New:
├── backend/src/memory/sessionManager.js    (DB CRUD for sessions, messages, feedback, retrieval_logs)
├── backend/src/memory/contextMemory.js     (Context builder, Q&A extractor, answer analyzer, difficulty suggester)
├── backend/src/services/interviewService.js (Main orchestrator — start, process, end interview)

Modified:
├── backend/src/controllers/interviewController.js (Stub → real service calls)
├── AI_CONTEXT_LOG.md (Full rewrite with detailed activity log)
```

---

### Key Observations
1. **Difficulty adaptation already working** — Short answers (44 chars) triggered `suggestDifficultyAdjustment` to return 'decrease', dropping difficulty from 3 → 2 → 1
2. **Session management is idempotent** — Sending start request with existing sessionId returns "Welcome back" instead of error
3. **Server logs show full tracing** — Every operation logged with sessionId, role, question number, difficulty level, and duration
4. **Response times** — First request ~1.4s (DB connection pooling), subsequent requests ~400-600ms (Neon HTTP driver latency)
