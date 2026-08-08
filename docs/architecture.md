# Architecture Documentation

## System Architecture

The AI Interview Agent uses a **RAG-based (Retrieval-Augmented Generation)** architecture to conduct intelligent, adaptive technical interviews.

## Core Flow

```
POST /api/interview
        │
        ▼
┌─────────────────┐
│  Controller     │ ─── Validate request, extract sessionId
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Interview       │ ─── Orchestrates the full interview flow
│ Service         │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌────────┐ ┌─────────┐
│Question│ │Feedback │
│Engine  │ │Engine   │
└───┬────┘ └─────────┘
    │
    ▼
┌─────────────────┐
│ RAG Pipeline    │
│                 │
│ ┌─────────────┐ │
│ │ Candidate   │ │ ─── Analyze missions, signals, strengths
│ │ Analyzer    │ │
│ └──────┬──────┘ │
│        │        │
│ ┌──────▼──────┐ │
│ │ Curriculum  │ │ ─── pgvector similarity search on curriculum chunks
│ │ Retriever   │ │
│ └──────┬──────┘ │
│        │        │
│ ┌──────▼──────┐ │
│ │ Prompt      │ │ ─── Assemble context into LLM prompt
│ │ Generator   │ │
│ └─────────────┘ │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ OpenRouter      │ ─── gpt-oss-20b via OpenRouter API
│ (LLM)           │
└─────────────────┘
```

## Database (Neon PostgreSQL + pgvector)

| Table | Purpose |
|-------|---------|
| sessions | Interview state, difficulty, topics covered |
| messages | Full conversation history |
| feedback | Final interview feedback |
| retrieval_logs | RAG retrieval audit trail |
| curriculum_embeddings | Vector embeddings of curriculum for RAG |

## Key Design Decisions

1. **pgvector over dedicated vector DB**: Neon PostgreSQL natively supports pgvector. Using a single database for both relational and vector data reduces operational complexity.

2. **OpenRouter API over local LLM**: Ensures consistent performance, deployment compatibility, and access to gpt-oss-20b without GPU requirements.

3. **In-memory candidate analysis + vector curriculum retrieval**: Candidate data is small (20 objects) and loaded from JSON. Curriculum is embedded into pgvector for semantic search.

4. **Session-based memory**: All interview state is persisted in PostgreSQL via sessionId. No in-memory state means the server is stateless and horizontally scalable.

5. **Adaptive difficulty**: The question engine adjusts difficulty (1-5) based on answer quality, stored per session.
