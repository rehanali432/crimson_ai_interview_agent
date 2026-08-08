import OpenAI from 'openai';
import config from '../utils/config.js';
import logger from '../utils/logger.js';
import { analyzeCandidate } from './candidateAnalyzer.js';
import { buildFeedbackPrompt } from './promptGenerator.js';

// OpenAI client (via OpenRouter)
const openai = new OpenAI({
  apiKey: config.openrouter.apiKey,
  baseURL: config.openrouter.baseUrl,
});

/**
 * Feedback Engine — generates structured interview feedback using LLM.
 *
 * Takes the full interview transcript and candidate analysis,
 * then produces actionable feedback with strengths, gaps, and recommendations.
 */

/**
 * Generate final interview feedback.
 *
 * @param {string} sessionId - Session ID
 * @param {object} session - Session state
 * @param {object} context - Full conversation context
 * @returns {object} Structured feedback
 */
export async function generateInterviewFeedback(sessionId, session, context) {
  const startTime = Date.now();

  logger.info('Generating interview feedback', {
    sessionId,
    questionsAsked: session.questionsAsked,
    topicsCovered: (session.topicsCovered || []).length,
  });

  // Analyze candidate profile
  const candidateAnalysis = analyzeCandidate(session.candidateData);

  // Build the feedback prompt
  const prompt = buildFeedbackPrompt({
    candidateAnalysis,
    conversationHistory: context.fullHistory,
    topicsCovered: session.topicsCovered || [],
    questionsAsked: session.questionsAsked,
  });

  try {
    const modelsToTry = [
      config.openrouter.model,
      'google/gemini-2.5-flash',
      'openai/gpt-4o-mini',
      'meta-llama/llama-3.3-70b-instruct'
    ].filter((v, i, a) => v && a.indexOf(v) === i);

    let rawResponse = '';
    for (const model of modelsToTry) {
      try {
        const response = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert technical interview assessor. Analyze the complete interview transcript and provide structured feedback. Return ONLY valid JSON.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 1500,
        });

        rawResponse = response.choices[0]?.message?.content?.trim() || '';
        if (rawResponse) break;
      } catch (err) {
        logger.warn(`Feedback model ${model} failed, trying fallback...`, { error: err.message });
      }
    }

    // Parse the JSON feedback
    const feedback = parseFeedbackResponse(rawResponse, session, candidateAnalysis, context);

    // Apply transcript quality check safeguards
    const transcriptEval = evaluateTranscriptQuality(context?.fullHistory);
    if (transcriptEval.quality === 'very_poor') {
      feedback.confidenceScore = 0.03; // 3% confidence
      feedback.strengths = ['Unable to demonstrate technical competence during the interview session'];
      feedback.summary = `${candidateAnalysis.name} provided non-technical, gibberish, or empty responses throughout the interview session. Zero technical competence was demonstrated.`;
    } else if (transcriptEval.maxScore && feedback.confidenceScore > transcriptEval.maxScore) {
      feedback.confidenceScore = transcriptEval.maxScore;
    }

    const elapsed = Date.now() - startTime;
    logger.info('Feedback generated', {
      sessionId,
      confidenceScore: feedback.confidenceScore,
      strengths: feedback.strengths.length,
      gaps: feedback.gaps.length,
      elapsed: `${elapsed}ms`,
    });

    return {
      ...feedback,
      rawLlmResponse: rawResponse,
    };
  } catch (error) {
    logger.error('Failed to generate LLM feedback', { sessionId, error: error.message });

    // Fallback: generate heuristic-based feedback
    return generateFallbackFeedback(session, context, candidateAnalysis);
  }
}

/**
 * Audit candidate messages in transcript for gibberish/nonsense/short responses.
 */
function evaluateTranscriptQuality(fullHistory) {
  if (!fullHistory || fullHistory.length === 0) return { quality: 'unknown' };

  const candidateMsgs = fullHistory.filter(m => m.role === 'user' || m.role === 'candidate');
  if (candidateMsgs.length === 0) return { quality: 'empty', maxScore: 0.03 };

  let badCount = 0;
  for (const msg of candidateMsgs) {
    const text = (msg.content || '').trim().toLowerCase();
    if (text.length < 35 || isGibberish(text)) {
      badCount++;
    }
  }

  const badRatio = badCount / candidateMsgs.length;
  if (badRatio >= 0.75) {
    return { quality: 'very_poor', maxScore: 0.04 };
  } else if (badRatio >= 0.4) {
    return { quality: 'poor', maxScore: 0.35 };
  }

  return { quality: 'normal', maxScore: 0.98 };
}

function isGibberish(text) {
  const lower = text.toLowerCase();
  const noise = ['lol', 'sfsfhs', 'asdf', 'qwerty', 'hello', 'hi', 'xxx', 'yyy', 'zzz', 'idk', 'dunno', 'whatever'];
  if (noise.some(n => lower === n || lower.includes(n))) return true;
  // Single word without technical keywords
  if (!text.includes(' ') && text.length > 4 && !['embeddings', 'vectors', 'python', 'langchain', 'pinecone', 'chroma'].includes(lower)) return true;
  return false;
}

/**
 * Parse the LLM's feedback response.
 */
function parseFeedbackResponse(rawResponse, session, candidateAnalysis, context) {
  try {
    let cleaned = rawResponse;
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        summary: parsed.summary || 'Interview completed.',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
        next: Array.isArray(parsed.next) ? parsed.next : [],
        confidenceScore: typeof parsed.confidenceScore === 'number'
          ? Math.max(0.01, Math.min(0.99, parsed.confidenceScore))
          : 0.5,
        daysToRevisit: Array.isArray(parsed.daysToRevisit) ? parsed.daysToRevisit : [],
      };
    }

    throw new Error('No JSON found in response');
  } catch (error) {
    logger.warn('Failed to parse feedback JSON, using heuristic fallback', {
      error: error.message,
    });

    return generateFallbackFeedback(session, context, candidateAnalysis);
  }
}

/**
 * Generate fallback feedback using heuristics when LLM fails.
 */
function generateFallbackFeedback(session, context, candidateAnalysis) {
  const topicsCovered = session.topicsCovered || [];
  const transcriptEval = evaluateTranscriptQuality(context?.fullHistory);

  if (transcriptEval.quality === 'very_poor') {
    return {
      summary: `${candidateAnalysis.name} completed the technical interview session, but provided non-technical, gibberish, or empty answers to all questions asked.`,
      strengths: ['Unable to demonstrate technical competence during the interview session'],
      gaps: ['Failed to answer basic technical questions on curriculum topics', 'Provided invalid/gibberish responses'],
      next: ['Study fundamental concepts in the 31-day curriculum', 'Practice answering technical questions directly'],
      confidenceScore: 0.03, // 3%
      daysToRevisit: topicsCovered,
    };
  }

  // Build basic feedback from candidate analysis
  const strengths = [];
  const gaps = [];
  const next = [];

  if (candidateAnalysis.acedMissions.length > 0) {
    strengths.push(`Demonstrated foundation in ${candidateAnalysis.acedMissions.slice(0, 3).map(m => m.title).join(', ')}`);
  }

  strengths.push(`Completed ${session.questionsAsked} interview questions covering ${topicsCovered.length} curriculum topics`);

  if (candidateAnalysis.failedMissions.length > 0) {
    gaps.push(`Struggled with: ${candidateAnalysis.failedMissions.map(m => m.title).join(', ')}`);
  }

  if (candidateAnalysis.skippedMissions.length > 0) {
    gaps.push(`Skipped topics: ${candidateAnalysis.skippedMissions.map(m => m.title).join(', ')}`);
  }

  next.push('Review curriculum objectives for topics with multiple attempts');
  next.push('Practice explaining technical concepts in interview settings');

  const daysToRevisit = [
    ...candidateAnalysis.failedMissions.map(m => m.day),
    ...candidateAnalysis.skippedMissions.map(m => m.day),
  ];

  let score = candidateAnalysis.overallStrength === 'strong' ? 0.8 : 0.5;
  if (transcriptEval.maxScore && score > transcriptEval.maxScore) {
    score = transcriptEval.maxScore;
  }

  return {
    summary: `${candidateAnalysis.name} completed the technical interview with ${session.questionsAsked} questions across ${topicsCovered.length} curriculum days.`,
    strengths,
    gaps: gaps.length > 0 ? gaps : ['No significant gaps identified during the interview'],
    next,
    confidenceScore: score,
    daysToRevisit,
  };
}
