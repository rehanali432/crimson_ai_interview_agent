import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  jsonb,
  vector,
  index,
} from 'drizzle-orm/pg-core';

// ─── Sessions ────────────────────────────────────────────────────────────────
// Each interview session, keyed by client-provided sessionId
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).unique().notNull(),
  candidateId: varchar('candidate_id', { length: 50 }).notNull(),
  candidateName: varchar('candidate_name', { length: 255 }).notNull(),
  candidateData: jsonb('candidate_data').notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  difficultyLevel: integer('difficulty_level').default(3).notNull(),
  topicsCovered: jsonb('topics_covered').default([]).notNull(),
  questionsAsked: integer('questions_asked').default(0).notNull(),
  currentPhase: varchar('current_phase', { length: 50 }).default('intro').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Messages ────────────────────────────────────────────────────────────────
// Every message in the interview conversation
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'interviewer' | 'candidate'
  content: text('content').notNull(),
  questionNumber: integer('question_number'),
  curriculumDay: integer('curriculum_day'),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  sessionIdx: index('messages_session_idx').on(table.sessionId),
}));

// ─── Feedback ────────────────────────────────────────────────────────────────
// Final interview feedback, one per session
export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).unique().notNull(),
  summary: text('summary').notNull(),
  strengths: jsonb('strengths').default([]).notNull(),
  gaps: jsonb('gaps').default([]).notNull(),
  nextSteps: jsonb('next_steps').default([]).notNull(),
  confidenceScore: decimal('confidence_score', { precision: 3, scale: 2 }),
  daysToRevisit: jsonb('days_to_revisit').default([]).notNull(),
  rawLlmResponse: text('raw_llm_response'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Retrieval Logs ──────────────────────────────────────────────────────────
// Logs every RAG retrieval for debugging and observability
export const retrievalLogs = pgTable('retrieval_logs', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  queryType: varchar('query_type', { length: 50 }).notNull(), // 'curriculum' | 'candidate' | 'follow_up'
  retrievedData: jsonb('retrieved_data').default({}).notNull(),
  relevanceScore: decimal('relevance_score', { precision: 5, scale: 4 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  sessionIdx: index('retrieval_session_idx').on(table.sessionId),
}));

// ─── Curriculum Embeddings ───────────────────────────────────────────────────
// Vector embeddings of curriculum chunks for RAG retrieval via pgvector
export const curriculumEmbeddings = pgTable('curriculum_embeddings', {
  id: serial('id').primaryKey(),
  day: integer('day').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  chunkType: varchar('chunk_type', { length: 50 }).notNull(), // 'objective' | 'tool' | 'overview'
  content: text('content').notNull(),
  moduleNumber: integer('module_number'),
  moduleName: varchar('module_name', { length: 255 }),
  dayType: varchar('day_type', { length: 50 }), // 'SETUP' | 'BUILD' | 'AI_CORE' | 'SHIP_IT' | 'LEARN' | 'OPTIMIZE' | 'CAPSTONE'
  embedding: vector('embedding', { dimensions: 1536 }), // text-embedding-3-small = 1536 dimensions
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  dayIdx: index('curriculum_day_idx').on(table.day),
}));
