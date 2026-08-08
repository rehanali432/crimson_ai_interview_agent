/**
 * Prompt Generator — builds structured LLM prompts for the interview system.
 *
 * Three main prompts:
 * 1. Interviewer — generates the next interview question
 * 2. Evaluator — evaluates a candidate's answer (used internally)
 * 3. Feedback — generates final interview feedback
 *
 * All prompts use retrieved curriculum context and candidate analysis.
 */

/**
 * Build the system prompt for the AI interviewer.
 * This is the "personality" of the interviewer.
 */
export function buildInterviewerSystemPrompt() {
  return `You are an expert, rigorous technical interviewer conducting a live technical interview for an AI engineering cohort. 

PERSONALITY:
- You are professional, direct, encouraging yet highly rigorous.
- You ask EXACTLY ONE question at a time.
- You sound like a real Senior Staff Engineer — sharp, thorough, and attentive to details.

CRITICAL EVALUATION & RESPONSE RULES:
1. EVALUATE PREVIOUS ANSWER FIRST:
   - Inspect the candidate's latest response in the conversation history against the previous question asked.
   - IF THE CANDIDATE'S RESPONSE IS A SIMPLE GREETING OR ACKNOWLEDGMENT (e.g. "hello", "hi", "let's begin", "ready", "ok", "sure", "yes"):
     - Do NOT call it gibberish or nonsense!
     - Politely acknowledge ("Great, let's dive right in." or "Glad you're ready!") and present the technical question directly.
   - IF THE CANDIDATE'S ANSWER IS GIBBERISH (e.g., "lol", "sfsfhs", "asdfgh", random letters), NONSENSE, OR UNRELATED KEYBOARD MASH:
     - You MUST explicitly call it out! Example: "That response appears to be gibberish and does not address the technical question I asked." or "That is not a valid answer to the question."
     - Do NOT gloss over it. Point out that no technical explanation was provided.
   - IF THE CANDIDATE'S ANSWER IS INCORRECT OR MISSING CORE CONCEPTS:
     - Clearly point out the misconception or error in 1 sentence.
   - IF THE CANDIDATE'S ANSWER IS CORRECT AND DETAILED:
     - Briefly acknowledge the strong point before advancing.

2. QUESTION GENERATION RULES:
   - NEVER reveal you are an AI.
   - NEVER list multiple questions — ask exactly ONE concise question (2-3 sentences max).
   - ALWAYS connect your question to the curriculum topic provided.
   - If the candidate gave a weak/gibberish answer, lower the difficulty or ask a fundamental clarifying question on the same topic.
   - If the candidate gave a strong answer, probe deeper or test edge cases.

QUESTION TYPES (vary these):
- Conceptual: "Can you explain how X works?"
- Applied: "How would you implement X in a project?"
- Comparative: "What's the difference between X and Y?"
- Debugging: "If X happened, what would you check first?"
- Design: "How would you architect X?"
- Trade-off: "What are the pros and cons of X vs Y?"`;
}

/**
 * Build the user prompt for generating the next interview question.
 */
export function buildQuestionPrompt({
  candidateAnalysis,
  topicContext,
  conversationHistory,
  difficulty,
  questionsAsked,
  topicsCovered,
  strategy,
}) {
  const difficultyLabels = {
    1: 'introductory (explain basic concepts)',
    2: 'foundational (understand core principles)',
    3: 'intermediate (apply knowledge practically)',
    4: 'advanced (deep technical understanding)',
    5: 'expert (architecture-level, edge cases, trade-offs)',
  };

  const strategyInstructions = {
    probe_fundamentals: 'The candidate struggled or provided an incorrect/gibberish answer. Call out the error/gibberish, then ask a simple fundamental question.',
    probe_depth: 'The candidate aced the previous question. Acknowledge their good answer, then ask a deeper question testing advanced understanding.',
    intro_only: 'The candidate skipped this topic previously. Ask a gentle introductory question.',
    standard: 'Evaluate their previous response first, then ask an appropriate follow-up or next technical question.',
    follow_up: 'The previous response was weak, short, or invalid. Point out what was missing, then ask a focused follow-up.',
  };

  let prompt = `CANDIDATE PROFILE:
- Name: ${candidateAnalysis.name}
- Role: ${candidateAnalysis.jobRole}
- Experience: ${candidateAnalysis.yearsExperience} years (${candidateAnalysis.experienceLevel})
- Overall Strength: ${candidateAnalysis.overallStrength}

INTERVIEW STATE:
- Questions asked so far: ${questionsAsked}
- Current difficulty level: ${difficulty}/5 — ${difficultyLabels[difficulty] || 'intermediate'}
- Topics already covered (curriculum days): [${topicsCovered.join(', ')}]

STRATEGY INSTRUCTION: ${strategyInstructions[strategy] || strategyInstructions.standard}

CURRICULUM CONTEXT FOR THIS QUESTION:
Topic: Day ${topicContext.day} — ${topicContext.title}
Type: ${topicContext.type || 'BUILD'}
Module: ${topicContext.module?.title || 'Unknown'}
Tools: ${topicContext.tools?.join(', ') || 'N/A'}
Learning Objectives:
${topicContext.objectives?.map((o, i) => `  ${i + 1}. ${o}`).join('\n') || 'N/A'}`;

  // Add retrieved curriculum chunks for additional context
  if (topicContext.retrievedChunks && topicContext.retrievedChunks.length > 0) {
    prompt += `\n\nRELEVANT CURRICULUM CHUNKS (from vector search):`;
    for (const chunk of topicContext.retrievedChunks) {
      prompt += `\n- [${chunk.chunkType}] ${chunk.content}`;
    }
  }

  // Add recent conversation
  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `\n\nFULL TRANSCRIPT OF RECENT CONVERSATION:`;
    const recent = conversationHistory.slice(-8); // Last 4 Q&A pairs
    for (const msg of recent) {
      const label = msg.role === 'assistant' ? 'INTERVIEWER' : 'CANDIDATE';
      prompt += `\n${label}: ${msg.content}`;
    }
  }

  prompt += `\n\nREMINDER: First evaluate the candidate's last answer (call out gibberish/errors if any!), then ask your ONE next question.`;

  return prompt;
}

/**
 * Build the prompt for generating final interview feedback.
 */
export function buildFeedbackPrompt({
  candidateAnalysis,
  conversationHistory,
  topicsCovered,
  questionsAsked,
}) {
  return `You are a Senior Staff Engineer evaluating a completed technical interview transcript.

CANDIDATE PROFILE:
- Name: ${candidateAnalysis.name}
- Role: ${candidateAnalysis.jobRole}
- Experience: ${candidateAnalysis.yearsExperience} years

INTERVIEW TRANSCRIPT TO EVALUATE:
${conversationHistory.map(m => {
  const label = m.role === 'assistant' ? 'INTERVIEWER' : 'CANDIDATE';
  return `${label}: ${m.content}`;
}).join('\n\n')}

CRITICAL EVALUATION RULES FOR CONFIDENCE SCORE & STRENGTHS:
- Read each INTERVIEWER question and CANDIDATE answer in the transcript above carefully.
- IF THE CANDIDATE GAVE ACCURATE, LOGICAL, AND CORRECT TECHNICAL ANSWERS TO THE QUESTIONS:
  - The "confidenceScore" MUST be HIGH (between 0.80 and 0.98, which is 80% - 98% confidence).
  - Under "strengths", list 2-4 SPECIFIC technical strengths demonstrated in their actual answers (e.g., "Demonstrated strong understanding of Sentence Transformers and cosine similarity").
  - Under "gaps", list any minor areas where their answers could be deeper.
- IF THE CANDIDATE ANSWERED PARTIALLY CORRECT OR HAD MIXED PERFORMANCE:
  - The "confidenceScore" MUST be between 0.45 and 0.75 (45% - 75% confidence).
  - Highlight both demonstrated strengths and identified gaps accurately from the transcript.
- IF THE CANDIDATE GAVE PURE GIBBERISH (e.g. "lol", "sfsfhs"), NONSENSE, OR NO VALID TECHNICAL ANSWERS TO ANY QUESTION:
  - The "confidenceScore" MUST be LESS THAN 0.05 (between 0.01 and 0.04, which is 1% - 4% confidence).
  - Under "strengths", write: ["Unable to demonstrate technical competence during the interview session"].
  - Under "gaps", list the tested topics as major gaps.

Respond in this exact JSON format:
{
  "summary": "A 2-3 sentence honest assessment of their transcript performance",
  "strengths": ["Specific strength 1 based on actual transcript answers", "..."],
  "gaps": ["Specific technical gap 1 based on actual transcript answers", "..."],
  "next": ["Specific recommendation 1", "..."],
  "confidenceScore": <number between 0.01 and 0.98 based strictly on transcript rules above>,
  "daysToRevisit": [array of curriculum day numbers they failed or struggled on]
}

Return ONLY valid JSON.`;
}

/**
 * Build a prompt for evaluating the quality of a candidate's answer.
 * Used internally to adjust difficulty.
 */
export function buildEvaluationPrompt(question, answer, topicContext) {
  return `You are evaluating a candidate's answer in a technical interview.

QUESTION: ${question}
TOPIC: Day ${topicContext.day} — ${topicContext.title}
CANDIDATE'S ANSWER: ${answer}

Rate this answer on a scale of 1-5:
1 = Incorrect or "I don't know"
2 = Partially correct but missing key concepts
3 = Correct but surface-level
4 = Good understanding with practical application
5 = Excellent — deep understanding, could teach this topic

Respond with ONLY a JSON object:
{
  "score": <1-5>,
  "assessment": "<one sentence explanation>",
  "shouldFollowUp": <true/false>,
  "followUpReason": "<why a follow-up would be valuable, or null>"
}

Return ONLY valid JSON.`;
}
