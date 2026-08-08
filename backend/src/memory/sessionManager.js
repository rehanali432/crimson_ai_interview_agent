import db, { sql } from '../db/index.js';
import { sessions, messages } from '../db/schema.js';
import logger from '../utils/logger.js';

/**
 * Session Manager — handles all database operations for interview sessions.
 * 
 * Responsibilities:
 * - Create new sessions
 * - Retrieve existing sessions by sessionId
 * - Update session state (difficulty, topics, phase, questions count)
 * - Mark sessions as completed
 */

/**
 * Create a new interview session in the database.
 */
export async function createSession({ sessionId, candidateId, candidateName, candidateData }) {
  logger.info('Creating new session', { sessionId, candidateId });

  try {
    await sql`
      INSERT INTO sessions (session_id, candidate_id, candidate_name, candidate_data, status, difficulty_level, topics_covered, questions_asked, current_phase)
      VALUES (${sessionId}, ${candidateId}, ${candidateName}, ${JSON.stringify(candidateData)}, 'active', 3, '[]'::jsonb, 0, 'intro')
    `;

    return await getSession(sessionId);
  } catch (error) {
    // If session already exists, just return it
    if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
      logger.info('Session already exists, returning existing', { sessionId });
      return await getSession(sessionId);
    }
    throw error;
  }
}

/**
 * Retrieve a session by sessionId.
 * Returns null if session doesn't exist.
 */
export async function getSession(sessionId) {
  const rows = await sql`
    SELECT * FROM sessions WHERE session_id = ${sessionId} LIMIT 1
  `;

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    sessionId: row.session_id,
    candidateId: row.candidate_id,
    candidateName: row.candidate_name,
    candidateData: row.candidate_data,
    status: row.status,
    difficultyLevel: row.difficulty_level,
    topicsCovered: row.topics_covered || [],
    questionsAsked: row.questions_asked,
    currentPhase: row.current_phase,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

/**
 * Update session state after a question is asked.
 */
export async function updateSessionState(sessionId, updates) {
  const {
    difficultyLevel,
    topicsCovered,
    questionsAsked,
    currentPhase,
  } = updates;

  logger.debug('Updating session state', { sessionId, updates });

  await sql`
    UPDATE sessions
    SET
      difficulty_level = COALESCE(${difficultyLevel ?? null}, difficulty_level),
      topics_covered = COALESCE(${topicsCovered ? JSON.stringify(topicsCovered) : null}::jsonb, topics_covered),
      questions_asked = COALESCE(${questionsAsked ?? null}, questions_asked),
      current_phase = COALESCE(${currentPhase ?? null}, current_phase)
    WHERE session_id = ${sessionId}
  `;
}

/**
 * Mark a session as completed.
 */
export async function completeSession(sessionId) {
  logger.info('Completing session', { sessionId });

  await sql`
    UPDATE sessions
    SET status = 'completed', completed_at = NOW(), current_phase = 'completed'
    WHERE session_id = ${sessionId}
  `;
}

/**
 * Save an interview message (from either interviewer or candidate).
 */
export async function saveMessage({ sessionId, role, content, questionNumber, curriculumDay, metadata = {} }) {
  await sql`
    INSERT INTO messages (session_id, role, content, question_number, curriculum_day, metadata)
    VALUES (${sessionId}, ${role}, ${content}, ${questionNumber ?? null}, ${curriculumDay ?? null}, ${JSON.stringify(metadata)}::jsonb)
  `;

  logger.debug('Message saved', { sessionId, role, questionNumber });
}

/**
 * Get all messages for a session, ordered chronologically.
 */
export async function getMessages(sessionId) {
  const rows = await sql`
    SELECT * FROM messages WHERE session_id = ${sessionId} ORDER BY created_at ASC
  `;

  return rows.map(row => ({
    id: row.id,
    sessionId: row.session_id,
    role: row.role,
    content: row.content,
    questionNumber: row.question_number,
    curriculumDay: row.curriculum_day,
    metadata: row.metadata || {},
    createdAt: row.created_at,
  }));
}

/**
 * Save interview feedback.
 */
export async function saveFeedback({ sessionId, summary, strengths, gaps, nextSteps, confidenceScore, daysToRevisit, rawLlmResponse }) {
  await sql`
    INSERT INTO feedback (session_id, summary, strengths, gaps, next_steps, confidence_score, days_to_revisit, raw_llm_response)
    VALUES (
      ${sessionId},
      ${summary},
      ${JSON.stringify(strengths)}::jsonb,
      ${JSON.stringify(gaps)}::jsonb,
      ${JSON.stringify(nextSteps)}::jsonb,
      ${confidenceScore ?? null},
      ${JSON.stringify(daysToRevisit)}::jsonb,
      ${rawLlmResponse ?? null}
    )
  `;

  logger.info('Feedback saved', { sessionId });
}

/**
 * Log a RAG retrieval event for observability.
 */
export async function logRetrieval({ sessionId, queryType, retrievedData, relevanceScore }) {
  await sql`
    INSERT INTO retrieval_logs (session_id, query_type, retrieved_data, relevance_score)
    VALUES (${sessionId}, ${queryType}, ${JSON.stringify(retrievedData)}::jsonb, ${relevanceScore ?? null})
  `;
}
