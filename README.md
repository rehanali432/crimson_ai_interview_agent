# 🎯 Crimson AI Interview Agent

> An intelligent AI-powered technical interviewer built for the ABTalks Vibe Coding Hackathon.

## What It Does

This is NOT a quiz engine. It's an **intelligent interviewer** that conducts realistic, conversational technical interviews using Retrieval-Augmented Generation (RAG).

The system:
- 🔍 **Retrieves** curriculum topics and candidate history via RAG (pgvector)
- 🧠 **Generates** personalized, adaptive questions using LLM
- 💬 **Maintains** full interview context across the conversation
- 📊 **Produces** structured feedback with actionable recommendations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, LangChain JS |
| LLM | OpenAI gpt-oss-20b via OpenRouter |
| Database | Neon PostgreSQL + pgvector |
| ORM | Drizzle |

## Project Structure

```
├── frontend/          # React + Vite application
├── backend/           # Express API + RAG engine
├── docs/              # Architecture documentation
├── prompts/           # System prompt templates
├── logs/              # Application logs
├── AI_CONTEXT_LOG.md  # Development session log
└── PROMPTS.md         # Hackathon prompt log
```

## Quick Start

### Prerequisites
- Node.js 18+
- Neon PostgreSQL database
- OpenRouter API key

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run db:migrate
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API

```
POST /api/interview
```

See [technical-spec.md](docs/technical-spec.md) for full API documentation.

## Team

Built by Rehan Ali for the ABTalks Vibe Coding Hackathon.

## License

MIT
