import { Router } from 'express';
import { getAllCandidates, lookupCandidate } from '../rag/candidateAnalyzer.js';

const router = Router();

/**
 * GET /api/candidates — List all available candidates.
 * Used by the frontend to populate the candidate selection dropdown.
 */
router.get('/candidates', (req, res) => {
  const candidates = getAllCandidates();
  res.json({ candidates });
});

/**
 * GET /api/candidates/:id — Get a specific candidate's full data.
 */
router.get('/candidates/:id', (req, res) => {
  const candidate = lookupCandidate(req.params.id);
  if (!candidate) {
    return res.status(404).json({
      error: { message: `Candidate ${req.params.id} not found`, status: 404 },
    });
  }
  res.json(candidate);
});

export default router;
