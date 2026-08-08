import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load candidates data at startup
const candidatesPath = resolve(__dirname, '../data/candidates.json');
const candidatesData = JSON.parse(readFileSync(candidatesPath, 'utf-8'));

/**
 * Candidate Analyzer — examines a candidate's mission history
 * to determine what topics to focus on, what to avoid, and
 * what difficulty level is appropriate.
 *
 * This is a core RAG component: retrieval over candidate history.
 */

/**
 * Analyze a candidate's profile and mission history.
 * Returns a structured analysis that drives question selection.
 */
export function analyzeCandidate(candidateData) {
  const member = candidateData?.member || candidateData;
  const missions = candidateData?.missions || [];
  const signals = candidateData?.signals || {};

  const analysis = {
    // ── Profile ──
    candidateId: member?.id || 'unknown',
    name: member?.name || 'Candidate',
    jobRole: member?.jobRole || 'Unknown Role',
    yearsExperience: member?.yearsExperience ?? 0,
    education: member?.education || '',
    experienceLevel: categorizeExperience(member?.yearsExperience),

    // ── Mission Analysis ──
    totalMissions: missions.length,
    passedMissions: [],
    failedMissions: [],
    skippedMissions: [],
    struggledMissions: [],  // passed but took many attempts
    acedMissions: [],       // passed first try

    // ── Curriculum Coverage ──
    coveredDays: [],
    uncoveredDays: [],
    strongTopics: [],
    weakTopics: [],
    gapTopics: [],

    // ── Signals ──
    commitDays: signals?.commitDays || 0,
    missionsCompleted: signals?.missionsCompleted || 0,
    missionsFirstTry: signals?.missionsFirstTry || 0,
    overallStrength: 'moderate', // 'strong' | 'moderate' | 'weak'

    // ── Interview Strategy ──
    recommendedDifficulty: 3,
    priorityTopics: [],
    avoidTopics: [],
  };

  // ── Categorize missions ──
  for (const mission of missions) {
    if (mission.skipped) {
      analysis.skippedMissions.push(mission);
      analysis.gapTopics.push({
        day: mission.day,
        title: mission.title,
        reason: 'skipped',
      });
    } else if (mission.passed === false) {
      analysis.failedMissions.push(mission);
      analysis.weakTopics.push({
        day: mission.day,
        title: mission.title,
        attempts: mission.attempts,
        reason: 'failed',
      });
    } else if (mission.passed === true) {
      analysis.passedMissions.push(mission);
      analysis.coveredDays.push(mission.day);

      if (mission.attempts === 1) {
        analysis.acedMissions.push(mission);
        analysis.strongTopics.push({
          day: mission.day,
          title: mission.title,
          attempts: 1,
          reason: 'first_try',
        });
      } else if (mission.attempts >= 4) {
        analysis.struggledMissions.push(mission);
        analysis.weakTopics.push({
          day: mission.day,
          title: mission.title,
          attempts: mission.attempts,
          reason: 'struggled',
        });
      }
    }
  }

  // ── Determine overall strength ──
  const firstTryRatio = missions.length > 0
    ? analysis.acedMissions.length / missions.length
    : 0;
  const failRatio = missions.length > 0
    ? (analysis.failedMissions.length + analysis.skippedMissions.length) / missions.length
    : 0;

  if (firstTryRatio > 0.6) {
    analysis.overallStrength = 'strong';
  } else if (failRatio > 0.3) {
    analysis.overallStrength = 'weak';
  } else {
    analysis.overallStrength = 'moderate';
  }

  // ── Recommended starting difficulty ──
  if (analysis.overallStrength === 'strong' && analysis.yearsExperience >= 5) {
    analysis.recommendedDifficulty = 4;
  } else if (analysis.overallStrength === 'strong') {
    analysis.recommendedDifficulty = 3;
  } else if (analysis.overallStrength === 'weak') {
    analysis.recommendedDifficulty = 2;
  } else {
    analysis.recommendedDifficulty = 3;
  }

  // ── Priority topics for interview ──
  // 1. Weak topics (failed or struggled) — probe fundamentals
  // 2. Strong topics — probe depth
  // 3. Gap topics (skipped) — ask intro-level only
  analysis.priorityTopics = [
    ...analysis.weakTopics.map(t => ({ ...t, priority: 'high', strategy: 'probe_fundamentals' })),
    ...analysis.strongTopics.slice(0, 4).map(t => ({ ...t, priority: 'medium', strategy: 'probe_depth' })),
    ...analysis.gapTopics.map(t => ({ ...t, priority: 'low', strategy: 'intro_only' })),
  ];

  // Topics to avoid asking advanced questions on
  analysis.avoidTopics = analysis.skippedMissions.map(m => m.day);

  logger.debug('Candidate analyzed', {
    candidateId: analysis.candidateId,
    overallStrength: analysis.overallStrength,
    passed: analysis.passedMissions.length,
    failed: analysis.failedMissions.length,
    skipped: analysis.skippedMissions.length,
    struggled: analysis.struggledMissions.length,
    aced: analysis.acedMissions.length,
    recommendedDifficulty: analysis.recommendedDifficulty,
  });

  return analysis;
}

// Load curriculum data for enrichment
const curriculumPath = resolve(__dirname, '../data/curriculum.json');
const curriculumData = JSON.parse(readFileSync(curriculumPath, 'utf-8'));

/**
 * Look up a candidate by ID and enrich with complete curriculum coverage data
 * (Modules, Daily Topics, Learning Objectives, Tools used).
 */
export function lookupCandidate(candidateId) {
  const candidate = candidatesData.candidates.find(
    c => c.member.id === candidateId
  );
  if (!candidate) return null;

  const missionsMap = new Map();
  (candidate.missions || []).forEach(m => {
    missionsMap.set(m.day, m);
  });

  const dailyTopics = [];
  const coveredToolsSet = new Set();
  const achievedObjectives = [];
  const moduleCoverageMap = new Map();

  // Initialize modules
  curriculumData.modules.forEach(mod => {
    moduleCoverageMap.set(mod.n, {
      number: mod.n,
      title: mod.title,
      totalDays: mod.days[1] - mod.days[0] + 1,
      coveredDays: 0,
      passedDays: 0,
      days: []
    });
  });

  // Map each curriculum day
  curriculumData.days.forEach(day => {
    const mission = missionsMap.get(day.day);
    let status = 'unattempted';
    let attempts = 0;

    if (mission) {
      if (mission.skipped) {
        status = 'skipped';
      } else if (mission.passed === false) {
        status = 'failed';
        attempts = mission.attempts || 1;
      } else if (mission.passed === true) {
        status = mission.attempts === 1 ? 'aced' : (mission.attempts >= 4 ? 'struggled' : 'passed');
        attempts = mission.attempts || 1;

        // Collect tools & objectives if passed
        (day.tools || []).forEach(t => coveredToolsSet.add(t));
        (day.objectives || []).forEach(obj => {
          achievedObjectives.push({ day: day.day, topic: day.title, objective: obj });
        });
      }
    }

    const topicItem = {
      day: day.day,
      title: day.title,
      type: day.type,
      tools: day.tools || [],
      objectives: day.objectives || [],
      status,
      attempts
    };

    dailyTopics.push(topicItem);

    // Update module breakdown
    for (const mod of curriculumData.modules) {
      if (day.day >= mod.days[0] && day.day <= mod.days[1]) {
        const modStat = moduleCoverageMap.get(mod.n);
        if (modStat) {
          modStat.days.push(topicItem);
          if (status === 'passed' || status === 'aced' || status === 'struggled') {
            modStat.passedDays++;
            modStat.coveredDays++;
          } else if (status === 'failed' || status === 'skipped') {
            modStat.coveredDays++;
          }
        }
        break;
      }
    }
  });

  const modulesBreakdown = Array.from(moduleCoverageMap.values());
  const toolsCovered = Array.from(coveredToolsSet);
  const candidateAnalysis = analyzeCandidate(candidate);

  return {
    ...candidate,
    analysis: candidateAnalysis,
    breakdown: {
      modules: modulesBreakdown,
      dailyTopics,
      achievedObjectives,
      toolsCovered,
      totalModulesCovered: modulesBreakdown.filter(m => m.passedDays > 0).length,
      totalTopicsCovered: dailyTopics.filter(t => t.status !== 'unattempted').length,
      totalTopicsPassed: dailyTopics.filter(t => ['passed', 'aced', 'struggled'].includes(t.status)).length,
      totalToolsMastered: toolsCovered.length,
      totalObjectivesAchieved: achievedObjectives.length,
    }
  };
}

/**
 * Get all available candidates (for the frontend dropdown).
 */
export function getAllCandidates() {
  return candidatesData.candidates.map(c => {
    const enriched = lookupCandidate(c.member.id);
    return {
      id: c.member.id,
      name: c.member.name,
      jobRole: c.member.jobRole,
      yearsExperience: c.member.yearsExperience,
      education: c.member.education,
      missionsCompleted: c.signals?.missionsCompleted || 0,
      overallStrength: enriched?.analysis?.overallStrength || 'moderate',
      breakdown: enriched?.breakdown,
    };
  });
}

/**
 * Categorize experience level from years.
 */
function categorizeExperience(years) {
  if (years === undefined || years === null) return 'unknown';
  if (years === 0) return 'entry';
  if (years <= 3) return 'junior';
  if (years <= 7) return 'mid';
  if (years <= 15) return 'senior';
  return 'staff';
}

/**
 * Select the next best curriculum day to ask about based on:
 * - What hasn't been asked yet in this interview
 * - Candidate's weak/strong areas
 * - Coverage requirements (minimum 4 different days)
 */
export function selectNextTopic(candidateAnalysis, topicsCovered, questionsAsked) {
  const covered = new Set(topicsCovered || []);

  // Build a scored list of candidate topics
  const scoredTopics = [];

  for (const topic of candidateAnalysis.priorityTopics) {
    if (covered.has(topic.day)) continue; // already asked

    let score = 0;

    // High priority weak topics get highest score early in interview
    if (topic.priority === 'high') {
      score = 100 - questionsAsked * 5; // Ask weak topics early
    } else if (topic.priority === 'medium') {
      score = 60 + questionsAsked * 3;  // Ask strong topics later for depth
    } else {
      score = 30; // Skipped topics only if needed for coverage
    }

    scoredTopics.push({ day: topic.day, title: topic.title, score, strategy: topic.strategy });
  }

  // If we haven't covered enough from the candidate's missions,
  // add any passed missions not yet covered
  for (const mission of candidateAnalysis.passedMissions) {
    if (covered.has(mission.day)) continue;
    if (scoredTopics.find(t => t.day === mission.day)) continue;

    scoredTopics.push({
      day: mission.day,
      title: mission.title,
      score: 40,
      strategy: mission.attempts === 1 ? 'probe_depth' : 'standard',
    });
  }

  // Sort by score (highest first)
  scoredTopics.sort((a, b) => b.score - a.score);

  if (scoredTopics.length === 0) {
    return null; // No more topics to ask about
  }

  return scoredTopics[0];
}
