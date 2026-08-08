import { getMessages } from './sessionManager.js';
import logger from '../utils/logger.js';

/**
 * Context Memory — builds the context window for LLM calls.
 * 
 * Responsibilities:
 * - Build conversation history for the LLM prompt
 * - Summarize previous Q&A pairs
 * - Track which topics have been covered
 * - Track candidate strengths/weaknesses from answers
 * - Manage token budget by trimming old messages
 */

/**
 * Build the conversation context for the LLM.
 * Returns a structured object with everything the LLM needs to know.
 */
export async function buildContext(sessionId, session) {
  const allMessages = await getMessages(sessionId);

  // Split messages into Q&A pairs
  const qaPairs = extractQAPairs(allMessages);

  // Analyze answer quality from conversation
  const answerAnalysis = analyzeAnswers(qaPairs);

  // Build condensed conversation history (last N turns to stay within token budget)
  const recentHistory = buildRecentHistory(allMessages, 10); // last 10 messages

  // Full conversation for deep analysis
  const fullHistory = allMessages.map(m => ({
    role: m.role === 'interviewer' ? 'assistant' : 'user',
    content: m.content,
  }));

  return {
    sessionId,
    candidateName: session.candidateName,
    questionsAsked: session.questionsAsked,
    difficultyLevel: session.difficultyLevel,
    currentPhase: session.currentPhase,
    topicsCovered: session.topicsCovered,
    qaPairs,
    answerAnalysis,
    recentHistory,
    fullHistory,
    messageCount: allMessages.length,
  };
}

/**
 * Extract Q&A pairs from the message history.
 * Each pair has the interviewer's question and the candidate's answer.
 */
function extractQAPairs(messages) {
  const pairs = [];
  let currentQuestion = null;

  for (const msg of messages) {
    if (msg.role === 'interviewer' && msg.questionNumber) {
      currentQuestion = {
        questionNumber: msg.questionNumber,
        question: msg.content,
        curriculumDay: msg.curriculumDay,
        metadata: msg.metadata,
      };
    } else if (msg.role === 'candidate' && currentQuestion) {
      pairs.push({
        ...currentQuestion,
        answer: msg.content,
        answeredAt: msg.createdAt,
      });
      currentQuestion = null;
    }
  }

  return pairs;
}

/**
 * Analyze candidate answers to determine strengths and weaknesses.
 * This is a pre-LLM heuristic — the actual quality assessment is done by the LLM.
 */
function analyzeAnswers(qaPairs) {
  const analysis = {
    totalAnswered: qaPairs.length,
    topicsByDay: {},
    averageAnswerLength: 0,
    shortAnswers: 0,    // < 50 chars — likely weak
    detailedAnswers: 0, // > 200 chars — likely strong
    skippedOrUnsure: 0, // contains "I don't know", "not sure", "skip"
  };

  if (qaPairs.length === 0) return analysis;

  let totalLength = 0;

  for (const pair of qaPairs) {
    totalLength += pair.answer.length;

    // Track topics by curriculum day
    if (pair.curriculumDay) {
      analysis.topicsByDay[pair.curriculumDay] = (analysis.topicsByDay[pair.curriculumDay] || 0) + 1;
    }

    // Length heuristics
    if (pair.answer.length < 50) {
      analysis.shortAnswers++;
    } else if (pair.answer.length > 200) {
      analysis.detailedAnswers++;
    }

    // Check for uncertainty signals
    const lower = pair.answer.toLowerCase();
    if (
      lower.includes("i don't know") ||
      lower.includes("not sure") ||
      lower.includes("i'm not familiar") ||
      lower.includes("skip") ||
      lower.includes("no idea") ||
      lower.includes("can't remember")
    ) {
      analysis.skippedOrUnsure++;
    }
  }

  analysis.averageAnswerLength = Math.round(totalLength / qaPairs.length);

  return analysis;
}

/**
 * Build recent conversation history (last N messages) for LLM context.
 * Formats messages in the OpenAI chat format.
 */
function buildRecentHistory(messages, limit) {
  const recent = messages.slice(-limit);
  return recent.map(m => ({
    role: m.role === 'interviewer' ? 'assistant' : 'user',
    content: m.content,
  }));
}

/**
 * Determine recommended difficulty adjustment based on answer analysis.
 * Returns: 'increase' | 'decrease' | 'maintain'
 */
export function suggestDifficultyAdjustment(answerAnalysis, currentDifficulty) {
  if (answerAnalysis.totalAnswered < 2) return 'maintain';

  const recentRatio = answerAnalysis.detailedAnswers / answerAnalysis.totalAnswered;
  const weakRatio = (answerAnalysis.shortAnswers + answerAnalysis.skippedOrUnsure) / answerAnalysis.totalAnswered;

  if (recentRatio > 0.6 && currentDifficulty < 5) {
    return 'increase';
  } else if (weakRatio > 0.5 && currentDifficulty > 1) {
    return 'decrease';
  }

  return 'maintain';
}
