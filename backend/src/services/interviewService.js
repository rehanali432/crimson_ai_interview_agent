import {
  createSession,
  getSession,
  updateSessionState,
  completeSession,
  saveMessage,
  saveFeedback,
} from '../memory/sessionManager.js';
import { buildContext, suggestDifficultyAdjustment } from '../memory/contextMemory.js';
import { generateQuestion, evaluateAnswer } from '../rag/questionEngine.js';
import { generateInterviewFeedback } from '../rag/feedbackEngine.js';
import { analyzeCandidate } from '../rag/candidateAnalyzer.js';
import { getFullDayContext } from '../rag/curriculumRetriever.js';
import config from '../utils/config.js';
import logger from '../utils/logger.js';

/**
 * Interview Service — the main orchestrator.
 * 
 * Handles the full interview lifecycle:
 * 1. Start a new interview (create session, generate first question)
 * 2. Process a conversation turn (evaluate answer, generate next question)
 * 3. End the interview (generate feedback, mark session complete)
 * 
 * In Phase 2, this uses stub question/feedback generation.
 * Phase 3 will wire in the RAG engine + LLM.
 */

/**
 * Start a new interview session.
 * Called when the first request comes in with candidate data.
 */
export async function startInterview(sessionId, candidateData) {
  // Check if session already exists (idempotent)
  let session = await getSession(sessionId);

  if (session) {
    logger.info('Session already exists, resuming', { sessionId });
    // If already active, return the last interviewer message or a resumption greeting
    return {
      reply: `Welcome back, ${session.candidateName}. Let's continue where we left off. I'm ready for your next answer.`,
      done: false,
    };
  }

  // Extract candidate info
  const member = candidateData?.member || candidateData;
  const candidateId = member?.id || 'unknown';
  const candidateName = member?.name || 'Candidate';

  // Create the session
  session = await createSession({
    sessionId,
    candidateId,
    candidateName,
    candidateData,
  });

  // Build context for initial question generation
  const context = await buildContext(sessionId, session);

  // Generate Question 1 immediately
  const firstQuestion = await generateNextQuestion(sessionId, session, context, session.difficultyLevel);

  // Save the interviewer's welcome & first question message
  const greeting = buildWelcomeMessage(candidateName, candidateData);
  const fullInitialMessage = `${greeting}\n\n**Question 1:** ${firstQuestion.text}`;

  const updatedTopics = [...new Set([...(session.topicsCovered || []), ...(firstQuestion.curriculumDays || [])])];
  await updateSessionState(sessionId, {
    questionsAsked: 1,
    topicsCovered: updatedTopics,
    currentPhase: 'technical',
  });

  await saveMessage({
    sessionId,
    role: 'interviewer',
    content: fullInitialMessage,
    questionNumber: 1,
    curriculumDay: firstQuestion.curriculumDays?.[0] || null,
    metadata: { phase: 'intro', type: 'greeting_with_question' },
  });

  logger.info('Interview started with Question 1', {
    sessionId,
    candidateId,
    candidateName,
    questionNumber: 1,
  });

  return {
    reply: fullInitialMessage,
    done: false,
  };
}

/**
 * Process a conversation turn.
 * Called when the candidate sends a message (answer).
 */
export async function processMessage(sessionId, candidateMessage) {
  // Get session
  const session = await getSession(sessionId);

  if (!session) {
    throw Object.assign(new Error(`No active session found for sessionId: ${sessionId}`), { status: 404 });
  }

  if (session.status === 'completed') {
    throw Object.assign(new Error('This interview session has already been completed'), { status: 400 });
  }

  // Save the candidate's message
  await saveMessage({
    sessionId,
    role: 'candidate',
    content: candidateMessage,
    questionNumber: session.questionsAsked,
    metadata: { phase: session.currentPhase },
  });

  // Build the full context from conversation history
  const context = await buildContext(sessionId, session);

  // Determine difficulty adjustment
  const difficultyAction = suggestDifficultyAdjustment(context.answerAnalysis, session.difficultyLevel);
  let newDifficulty = session.difficultyLevel;
  
  const isWeakOrGibberish = candidateMessage.trim().length < 25 || 
    ['lol', 'sfsfhs', 'asdf', 'qwerty', 'idk', 'dunno', 'whatever'].some(w => candidateMessage.toLowerCase().includes(w));
  
  if (isWeakOrGibberish || difficultyAction === 'decrease') {
    newDifficulty = Math.max(1, newDifficulty - 1);
  } else if (difficultyAction === 'increase') {
    newDifficulty = Math.min(5, newDifficulty + 1);
  }

  // Check if interview should end
  const shouldEnd = shouldEndInterview(session, context);

  if (shouldEnd) {
    return await endInterview(sessionId, session, context);
  }

  // Generate the next question
  // Phase 2: stub — Phase 3 will use RAG + LLM
  const nextQuestionNumber = session.questionsAsked + 1;
  const nextQuestion = await generateNextQuestion(sessionId, session, context, newDifficulty);

  // Update session state
  const updatedTopics = [...new Set([...(session.topicsCovered || []), ...(nextQuestion.curriculumDays || [])])];
  await updateSessionState(sessionId, {
    questionsAsked: nextQuestionNumber,
    difficultyLevel: newDifficulty,
    topicsCovered: updatedTopics,
    currentPhase: nextQuestionNumber >= 6 ? 'deep_dive' : 'technical',
  });

  // Save the interviewer's question
  await saveMessage({
    sessionId,
    role: 'interviewer',
    content: nextQuestion.text,
    questionNumber: nextQuestionNumber,
    curriculumDay: nextQuestion.curriculumDays?.[0] || null,
    metadata: {
      phase: session.currentPhase,
      difficulty: newDifficulty,
      difficultyAction,
      type: nextQuestion.type || 'technical',
    },
  });

  logger.info('Question generated', {
    sessionId,
    questionNumber: nextQuestionNumber,
    difficulty: newDifficulty,
    difficultyAction,
    topicsCovered: updatedTopics.length,
  });

  return {
    reply: nextQuestion.text,
    done: false,
  };
}

/**
 * End the interview and generate feedback.
 */
async function endInterview(sessionId, session, context) {
  logger.info('Ending interview', { sessionId, questionsAsked: session.questionsAsked });

  // Generate feedback
  // Phase 2: stub feedback — Phase 3 will use LLM
  const feedback = await generateFeedback(sessionId, session, context);

  // Save feedback to DB
  await saveFeedback({
    sessionId,
    summary: feedback.summary,
    strengths: feedback.strengths,
    gaps: feedback.gaps,
    nextSteps: feedback.next,
    confidenceScore: feedback.confidenceScore,
    daysToRevisit: feedback.daysToRevisit || [],
    rawLlmResponse: JSON.stringify(feedback),
  });

  // Mark session as completed
  await completeSession(sessionId);

  // Save the closing message
  const closingMessage = `Thank you for your time, ${session.candidateName}. The interview is now complete. I've prepared detailed feedback on your performance.`;

  await saveMessage({
    sessionId,
    role: 'interviewer',
    content: closingMessage,
    metadata: { phase: 'closing', type: 'farewell' },
  });

  return {
    reply: closingMessage,
    done: true,
    feedback: {
      summary: feedback.summary,
      strengths: feedback.strengths,
      gaps: feedback.gaps,
      next: feedback.next,
      confidenceScore: feedback.confidenceScore,
      daysToRevisit: feedback.daysToRevisit || [],
    },
  };
}

/**
 * Determine if the interview should end.
 */
function shouldEndInterview(session, context) {
  const { minQuestions, maxQuestions, minCurriculumDays } = config.interview;

  // Must ask at least minQuestions
  if (session.questionsAsked < minQuestions) return false;

  // Must cover at least minCurriculumDays different topics
  const uniqueDays = new Set(session.topicsCovered || []);
  if (uniqueDays.size < minCurriculumDays && session.questionsAsked < maxQuestions) return false;

  // End at maxQuestions regardless
  if (session.questionsAsked >= maxQuestions) return true;

  // End if we've met both minimums
  if (session.questionsAsked >= minQuestions && uniqueDays.size >= minCurriculumDays) return true;

  return false;
}

/**
 * Build a personalized welcome message based on candidate profile.
 */
function buildWelcomeMessage(candidateName, candidateData) {
  const member = candidateData?.member || candidateData;
  const role = member?.jobRole || '';
  const experience = member?.yearsExperience;
  const missions = candidateData?.missions || [];
  const completedCount = missions.filter(m => m.passed).length;

  let greeting = `Welcome, ${candidateName}. I'm your technical interviewer today.`;

  if (role) {
    greeting += ` I see you're working as a ${role}`;
    if (experience !== undefined) {
      greeting += ` with ${experience} ${experience === 1 ? 'year' : 'years'} of experience`;
    }
    greeting += '.';
  }

  if (completedCount > 0) {
    greeting += ` You've completed ${completedCount} missions in the AI cohort curriculum, which is great.`;
  }

  greeting += ` I'll be asking you questions across several topics to understand your depth of knowledge. This is a conversation, not a quiz — take your time and think through your answers. Let's begin.`;

  return greeting;
}

/**
 * Generate the next interview question using the RAG pipeline.
 * Pipeline: Candidate Analysis → Topic Selection → pgvector Retrieval → LLM Generation
 */
async function generateNextQuestion(sessionId, session, context, difficulty) {
  try {
    return await generateQuestion(sessionId, session, context, difficulty);
  } catch (error) {
    logger.error('RAG question generation failed, using fallback', {
      sessionId,
      error: error.message,
    });

    // Fallback: generate a generic question based on candidate analysis
    const analysis = analyzeCandidate(session.candidateData);
    const topic = analysis.priorityTopics.find(
      t => !(session.topicsCovered || []).includes(t.day)
    );

    if (topic) {
      const dayContext = await getFullDayContext(topic.day);
      return {
        text: `Let's talk about ${dayContext?.title || topic.title}. Can you walk me through your understanding of the key concepts covered in this topic?`,
        curriculumDays: [topic.day],
        type: 'technical',
        strategy: 'fallback',
      };
    }

    return {
      text: `Tell me about a concept from the AI curriculum that you found particularly interesting or challenging, and explain why.`,
      curriculumDays: [],
      type: 'general',
      strategy: 'fallback',
    };
  }
}

/**
 * Generate final interview feedback using the LLM.
 * Falls back to heuristic feedback if LLM fails.
 */
async function generateFeedback(sessionId, session, context) {
  try {
    return await generateInterviewFeedback(sessionId, session, context);
  } catch (error) {
    logger.error('LLM feedback generation failed, using heuristic fallback', {
      sessionId,
      error: error.message,
    });

    // Heuristic fallback
    const analysis = analyzeCandidate(session.candidateData);
    return {
      summary: `${session.candidateName} completed the technical interview with ${session.questionsAsked} questions across ${(session.topicsCovered || []).length} curriculum topics.`,
      strengths: ['Completed the full interview process'],
      gaps: analysis.weakTopics.map(t => `Needs review: ${t.title}`),
      next: ['Review curriculum topics where multiple attempts were needed'],
      confidenceScore: analysis.overallStrength === 'strong' ? 0.8 : 0.5,
      daysToRevisit: analysis.weakTopics.map(t => t.day),
    };
  }
}
