import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import checkOnboarding from '../middlewares/checkOnboarding.middleware.js';
import { getFullStats } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/stats', verifyToken, checkOnboarding, getFullStats);

export default router;
