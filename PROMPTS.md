# Prompts Log

> Every prompt used during development is recorded here for hackathon authenticity and reproducibility.

---

## Prompt 1

**Timestamp:** 2026-08-07 23:30 IST  
**AI Model:** Claude Opus 4.6 (Thinking)  
**Prompt:** Full project specification including requirements, tech stack, folder structure, RAG requirements, memory system, question engine, feedback format, database schema, UI style, logging requirements, and development order.  
**Result:** Created comprehensive Phase 1 implementation plan covering architecture, folder structure, database schema (sessions, messages, feedback, retrieval_logs), dependency lists, and environment configuration.  
**Files Created:**
- `implementation_plan.md` (artifact)

---

## Prompt 2

**Timestamp:** 2026-08-07 23:40 IST  
**AI Model:** Claude Opus 4.6 (Thinking)  
**Prompt:** User approved plan with feedback: (1) Must use vector DB per hackathon requirement, (2) Provided OpenRouter API key, (3) Use gpt-oss-20b model, (4) Use API not local.  
**Result:** Updated architecture to use pgvector on Neon PostgreSQL. Confirmed OpenRouter API usage. Started Phase 1 execution.  
**Files Created:**
- `.gitignore`
- `README.md`
- `AI_CONTEXT_LOG.md`
- `PROMPTS.md`
- Backend foundation files (in progress)

---

## Prompt 3

**Timestamp:** 2026-08-07 23:55 IST  
**AI Model:** Claude Opus 4.6 (Thinking)  
**Prompt:** "Continue with Phase 2 but in AI_CONTEXT_LOG mention everything — every folder, every file, every action in order. One by one activity log."  
**Result:** Rewrote AI_CONTEXT_LOG.md with 29-file, 12-step chronological activity log for Phase 1. Built Phase 2: sessionManager.js (8 DB functions), contextMemory.js (context builder + answer analyzer + difficulty suggester), interviewService.js (full lifecycle orchestrator). Updated controller from stub to real service. All 7 tests passed.  
**Files Created:**
- `backend/src/memory/sessionManager.js`
- `backend/src/memory/contextMemory.js`
- `backend/src/services/interviewService.js`
- `backend/src/controllers/interviewController.js` (modified)
- `AI_CONTEXT_LOG.md` (rewritten)

---

## Prompt 4

**Timestamp:** 2026-08-08 13:55 IST  
**AI Model:** Claude Opus 4.6 (Thinking)  
**Prompt:** "Resume from where we stopped or paused" (Phase 3: RAG Engine)  
**Result:** Built the complete RAG engine — candidateAnalyzer (mission analysis + topic selector), curriculumRetriever (217 chunks embedded into pgvector via text-embedding-3-small), promptGenerator (4 LLM prompts), questionEngine (full RAG pipeline), feedbackEngine (LLM-powered feedback + fallback). Wired everything to interviewService. Added candidates API. Tested with Emily Chen — system generates contextual, deep technical questions that adapt based on candidate strength and topic coverage.  
**Files Created:**
- `backend/src/rag/candidateAnalyzer.js`
- `backend/src/rag/curriculumRetriever.js`
- `backend/src/rag/promptGenerator.js`
- `backend/src/rag/questionEngine.js`
- `backend/src/rag/feedbackEngine.js`
- `backend/src/routes/candidateRoutes.js`
- `backend/src/services/interviewService.js` (modified — stub → real RAG)
- `backend/src/app.js` (modified — routes + seeder)
- `AI_CONTEXT_LOG.md` (updated with Phase 3 session log)

---

## Prompt 5

**Timestamp:** 2026-08-08 14:15 IST  
**AI Model:** Gemini 3.1 Pro (High)  
**Prompt:** "build it", followed by "continue it and use the log file as context and resume from wherer it has stopped"  
**Result:** Built Phase 5 (Frontend) and completed Phase 6 (Integration) simultaneously. Implemented the full UI including the `Landing` page with an animated hero and candidate dropdown, the `Interview` chat interface with live typing indicators and progress tracking, and the `Feedback` dashboard with data visualization for the LLM-generated assessment. Wired the React frontend to the Express backend via `/api` proxy. Tested frontend components and handled API loading/error states.  
**Files Created:**
- `frontend/src/services/api.js` (modified)
- `frontend/src/components/TypingIndicator.jsx`
- `frontend/src/components/MessageBubble.jsx`
- `frontend/src/components/ProgressBar.jsx`
- `frontend/src/pages/Landing.jsx`
- `frontend/src/pages/Interview.jsx`
- `frontend/src/pages/Feedback.jsx`
- `frontend/src/pages/NotFound.jsx`
---

## Prompt 9

**Timestamp:** 2026-08-08 15:36 IST  
**AI Model:** Gemini 3.6 Flash (High)  
**Prompt:** "push this into github"  
**Result:** Initialized git repository, created `.env.example`, staged all 52 project files, committed `feat: complete Crimson AI Technical Interview Agent (RAG + pgvector + full UI revamp)`, linked remote origin `https://github.com/rehanali432/crimson_ai_interview_agent.git`, and pushed branch `main`.  
**Files Created/Modified:**
- `backend/.env.example` (created)
- `.git` (initialized)
- `AI_CONTEXT_LOG.md` (updated)
- `PROMPTS.md` (updated)





