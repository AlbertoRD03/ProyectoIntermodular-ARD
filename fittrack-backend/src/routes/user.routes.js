import express from 'express';
import {
  completeOnboarding,
  getProfile,
  updateProfile,
  deleteAccount
} from '../controllers/user.controller.js';
import {
  addWeightEntry,
  listWeightEntries,
  removeWeightEntry
} from '../controllers/weightEntry.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.put('/onboarding', verifyToken, completeOnboarding);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.delete('/profile', verifyToken, deleteAccount);
router.get('/weight-entries', verifyToken, listWeightEntries);
router.post('/weight-entries', verifyToken, addWeightEntry);
router.delete('/weight-entries/:id', verifyToken, removeWeightEntry);

export default router;
