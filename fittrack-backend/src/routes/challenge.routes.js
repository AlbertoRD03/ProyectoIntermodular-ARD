import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import {
  createChallengeController,
  listChallengesController,
  updateChallengeStatusController
} from '../controllers/challenge.controller.js';

const router = express.Router();

router.get('/', verifyToken, listChallengesController);
router.post('/', verifyToken, createChallengeController);
router.patch('/:id/status', verifyToken, updateChallengeStatusController);

export default router;
