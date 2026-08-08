import { Router } from 'express';
import { handleInterview } from '../controllers/interviewController.js';

const router = Router();

// POST /api/interview — main interview endpoint (per hackathon spec)
router.post('/interview', handleInterview);

export default router;
