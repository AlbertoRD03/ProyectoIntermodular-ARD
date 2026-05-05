import express from 'express';
import {
  completeOnboarding,
  getProfile,
  updateProfile,
  deleteAccount
} from '../controllers/user.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.put('/onboarding', verifyToken, completeOnboarding);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.delete('/profile', verifyToken, deleteAccount);

export default router;
