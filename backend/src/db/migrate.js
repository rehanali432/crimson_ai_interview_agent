import { sql } from './index.js';
import logger from '../utils/logger.js';

/**
 * Run database migrations — creates tables if they don't exist.
 * Uses raw SQL since we're using the Neon HTTP driver which doesn't
 * support Drizzle's standard migration runner.
 */
async function migrate() {
  logger.info('Starting database migration...');

  try {
    // Enable pgvector extension
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;
    logger.info('pgvector extension enabled');

    // ─── Sessions table ───
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        candidate_id VARCHAR(50) NOT NULL,
        candidate_name VARCHAR(255) NOT NULL,
        candidate_data JSONB NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        difficulty_level INTEGER NOT NULL DEFAULT 3,
        topics_covered JSONB NOT NULL DEFAULT '[]'::jsonb,
        questions_asked INTEGER NOT NULL DEFAULT 0,
        current_phase VARCHAR(50) NOT NULL DEFAULT 'intro',
        started_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    logger.info('Table created: sessions');

    // ─── Messages table ───
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        question_number INTEGER,
        curriculum_day INTEGER,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS messages_session_idx ON messages (session_id)`;
    logger.info('Table created: messages');

    // ─── Feedback table ───
    await sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        summary TEXT NOT NULL,
        strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
        gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
        next_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
        confidence_score DECIMAL(3,2),
        days_to_revisit JSONB NOT NULL DEFAULT '[]'::jsonb,
        raw_llm_response TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    logger.info('Table created: feedback');

    // ─── Retrieval Logs table ───
    await sql`
      CREATE TABLE IF NOT EXISTS retrieval_logs (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        query_type VARCHAR(50) NOT NULL,
        retrieved_data JSONB NOT NULL DEFAULT '{}'::jsonb,
        relevance_score DECIMAL(5,4),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS retrieval_session_idx ON retrieval_logs (session_id)`;
    logger.info('Table created: retrieval_logs');

    // ─── Curriculum Embeddings table ───
    await sql`
      CREATE TABLE IF NOT EXISTS curriculum_embeddings (
        id SERIAL PRIMARY KEY,
        day INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        chunk_type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        module_number INTEGER,
        module_name VARCHAR(255),
        day_type VARCHAR(50),
        embedding vector(1536),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS curriculum_day_idx ON curriculum_embeddings (day)`;
    logger.info('Table created: curriculum_embeddings');

    logger.info('All migrations completed successfully ✅');
  } catch (error) {
    logger.error('Migration failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Run migrations when this file is executed directly
migrate();
