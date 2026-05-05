import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import {
  listLogros,
  createGoal,
  registerGoalProgress
} from '../controllers/gamificacion.controller.js';

const router = express.Router();

router.get('/logros', verifyToken, listLogros);
router.post('/objetivos', verifyToken, createGoal);
router.post('/objetivos/:id/progreso', verifyToken, registerGoalProgress);

export default router;
