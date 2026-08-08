import OpenAI from 'openai';
import config from '../utils/config.js';
import logger from '../utils/logger.js';
import { analyzeCandidate, selectNextTopic } from './candidateAnalyzer.js';
import { retrieveCurriculumChunks, getFullDayContext } from './curriculumRetriever.js';
import { buildInterviewerSystemPrompt, buildQuestionPrompt, buildEvaluationPrompt } from './promptGenerator.js';
import { logRetrieval } from '../memory/sessionManager.js';

// OpenAI client (via OpenRouter)
const openai = new OpenAI({
  apiKey: config.openrouter.apiKey,
  baseURL: config.openrouter.baseUrl,
});

/**
 * Question Engine — the brain of the RAG-powered interview system.
 *
 * Pipeline:
 * 1. Analyze candidate (missions, strengths, weaknesses)
 * 2. Select next topic (based on coverage, priority, difficulty)
 * 3. Retrieve curriculum context (pgvector similarity search)
 * 4. Build prompt (candidate + curriculum + conversation + strategy)
 * 5. Generate question via LLM
 * 6. Return structured question object
 */

/**
 * Generate the next interview question using the full RAG pipeline.
 *
 * @param {string} sessionId - Current session ID
 * @param {object} session - Current session state
 * @param {object} context - Conversation context from contextMemory
 * @param {number} difficulty - Current difficulty level (1-5)
 * @returns {object} { text, curriculumDays, type, strategy }
 */
export async function generateQuestion(sessionId, session, context, difficulty) {
  const startTime = Date.now();

  // ── Step 1: Analyze candidate ──
  const candidateAnalysis = analyzeCandidate(session.candidateData);

  // ── Step 2: Select next topic ──
  const nextTopic = selectNextTopic(
    candidateAnalysis,
    session.topicsCovered || [],
    session.questionsAsked
  );

  // If no more topics, generate a wrap-up question
  if (!nextTopic) {
    logger.info('No more topics available, generating wrap-up', { sessionId });
    return await generateWrapUpQuestion(sessionId, context, candidateAnalysis);
  }

  // ── Step 3: Retrieve curriculum context ──
  // 3a: Get the full day context from JSON
  const dayContext = await getFullDayContext(nextTopic.day);

  // 3b: Retrieve related chunks via pgvector similarity search
  const searchQuery = `${dayContext.title} ${dayContext.objectives.join(' ')}`;
  const retrievedChunks = await retrieveCurriculumChunks(searchQuery, 3, {
    dayNumbers: [nextTopic.day],
  });

  // Log the retrieval for observability
  await logRetrieval({
    sessionId,
    queryType: 'curriculum',
    retrievedData: {
      selectedDay: nextTopic.day,
      selectedTitle: nextTopic.title,
      strategy: nextTopic.strategy,
      chunksRetrieved: retrievedChunks.length,
      topSimilarity: retrievedChunks[0]?.similarity,
    },
    relevanceScore: retrievedChunks[0]?.similarity || 0,
  });

  // Combine direct context with retrieved chunks
  const topicContext = {
    ...dayContext,
    retrievedChunks,
  };

  // ── Step 4: Determine question strategy ──
  let strategy = nextTopic.strategy || 'standard';

  // Check if last answer was weak — if so, follow up instead
  if (context.qaPairs.length > 0) {
    const lastPair = context.qaPairs[context.qaPairs.length - 1];
    if (lastPair.answer.length < 50 || containsUncertainty(lastPair.answer)) {
      // If last answer was on the same topic, do a follow-up
      if (lastPair.curriculumDay === nextTopic.day) {
        strategy = 'follow_up';
      }
    }
  }

  // ── Step 5: Build prompt and call LLM ──
  const systemPrompt = buildInterviewerSystemPrompt();
  const userPrompt = buildQuestionPrompt({
    candidateAnalysis,
    topicContext,
    conversationHistory: context.recentHistory,
    difficulty,
    questionsAsked: session.questionsAsked,
    topicsCovered: session.topicsCovered || [],
    strategy,
  });

  const question = await callLLM(systemPrompt, userPrompt);

  const elapsed = Date.now() - startTime;
  logger.info('Question generated via RAG pipeline', {
    sessionId,
    day: nextTopic.day,
    topic: nextTopic.title,
    strategy,
    difficulty,
    elapsed: `${elapsed}ms`,
  });

  return {
    text: question,
    curriculumDays: [nextTopic.day],
    type: 'technical',
    strategy,
    topicTitle: nextTopic.title,
  };
}

/**
 * Evaluate a candidate's answer quality.
 * Returns a score (1-5) and whether a follow-up is recommended.
 */
export async function evaluateAnswer(question, answer, topicContext) {
  if (!topicContext) {
    // If no topic context, return a neutral evaluation
    return { score: 3, assessment: 'Standard response', shouldFollowUp: false };
  }

  const prompt = buildEvaluationPrompt(question, answer, topicContext);

  try {
    const response = await callLLM(
      'You are a technical interview evaluator. Return ONLY valid JSON.',
      prompt
    );

    // Parse JSON response
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const evaluation = JSON.parse(cleaned);

    return {
      score: Math.max(1, Math.min(5, evaluation.score || 3)),
      assessment: evaluation.assessment || '',
      shouldFollowUp: evaluation.shouldFollowUp || false,
      followUpReason: evaluation.followUpReason || null,
    };
  } catch (error) {
    logger.warn('Failed to parse evaluation response', { error: error.message });
    return { score: 3, assessment: 'Unable to evaluate', shouldFollowUp: false };
  }
}

/**
 * Generate a wrap-up question when all topics have been covered.
 */
async function generateWrapUpQuestion(sessionId, context, candidateAnalysis) {
  const systemPrompt = buildInterviewerSystemPrompt();
  const userPrompt = `CANDIDATE: ${candidateAnalysis.name} (${candidateAnalysis.jobRole}, ${candidateAnalysis.yearsExperience} years experience)

All planned topics have been covered. This is the final question of the interview.

Generate a thoughtful closing question that:
1. Asks about the candidate's overall experience with the AI curriculum
2. Or asks what they found most challenging/interesting
3. Or asks how they would apply what they've learned

Keep it conversational and warm — this is the wrap-up.`;

  const question = await callLLM(systemPrompt, userPrompt);

  return {
    text: question,
    curriculumDays: [],
    type: 'wrap_up',
    strategy: 'closing',
  };
}

/**
 * Call the LLM via OpenRouter with automatic model fallback for maximum reliability and speed.
 */
async function callLLM(systemPrompt, userPrompt) {
  const modelsToTry = [
    config.openrouter.model,
    'google/gemini-2.5-flash',
    'openai/gpt-4o-mini',
    'meta-llama/llama-3.3-70b-instruct'
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      logger.debug(`Attempting LLM completion with model: ${model}`);
      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (content) {
        return content;
      }
    } catch (error) {
      logger.warn(`Model ${model} failed, trying next fallback`, { error: error.message });
      lastError = error;
    }
  }

  logger.error('All LLM model fallbacks failed', { error: lastError?.message });
  throw new Error(`LLM call failed across all models: ${lastError?.message}`);
}

/**
 * Check if an answer contains uncertainty signals.
 */
function containsUncertainty(answer) {
  const lower = answer.toLowerCase();
  const signals = ["i don't know", "not sure", "i'm not familiar", "skip", "no idea", "can't remember", "i think maybe"];
  return signals.some(s => lower.includes(s));
}
