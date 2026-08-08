import { startInterview, processMessage } from '../services/interviewService.js';
import logger from '../utils/logger.js';

/**
 * Interview controller — handles POST /api/interview
 * 
 * This is the thin HTTP layer. All business logic is in interviewService.
 * 
 * Flow:
 * 1. First call (with candidate): Initialize session → startInterview()
 * 2. Subsequent calls (with message): Process answer → processMessage()
 * 3. Final response: Includes feedback when done=true
 */
export async function handleInterview(req, res, next) {
  try {
    const { sessionId, candidate, message } = req.body;

    // Validate sessionId is present
    if (!sessionId) {
      return res.status(400).json({
        error: { message: 'sessionId is required', status: 400 },
      });
    }

    // ─── Start Interview (first request with candidate data) ───
    if (candidate && !message) {
      logger.info('Controller: starting interview', {
        sessionId,
        candidateId: candidate?.member?.id,
        candidateName: candidate?.member?.name,
      });

      const result = await startInterview(sessionId, candidate);
      return res.json(result);
    }

    // ─── Conversation Turn (subsequent requests with message) ───
    if (message) {
      logger.info('Controller: processing turn', {
        sessionId,
        messageLength: message.length,
      });

      const result = await processMessage(sessionId, message);
      return res.json(result);
    }

    // ─── Invalid request ───
    return res.status(400).json({
      error: {
        message: 'Request must include either "candidate" (to start) or "message" (to continue)',
        status: 400,
      },
    });
  } catch (error) {
    next(error);
  }
}
