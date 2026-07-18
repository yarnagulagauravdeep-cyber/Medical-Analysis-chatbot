import express from 'express';
import { analyzeMetrics } from '../controllers/intakeController.js';

const router = express.Router();

router.post('/analyze', analyzeMetrics);

export default router;