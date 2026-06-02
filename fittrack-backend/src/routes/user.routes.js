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
import {
  followUserController,
  getPublicProfileController,
  listFollowersController,
  listFollowingController,
  searchUsersController,
  unfollowUserController
} from '../controllers/social.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.put('/onboarding', verifyToken, completeOnboarding);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.delete('/profile', verifyToken, deleteAccount);
router.get('/weight-entries', verifyToken, listWeightEntries);
router.post('/weight-entries', verifyToken, addWeightEntry);
router.delete('/weight-entries/:id', verifyToken, removeWeightEntry);

// Social
router.get('/search', verifyToken, searchUsersController);
router.get('/:id/public', verifyToken, getPublicProfileController);
router.post('/:id/follow', verifyToken, followUserController);
router.delete('/:id/follow', verifyToken, unfollowUserController);
router.get('/:id/followers', verifyToken, listFollowersController);
router.get('/:id/following', verifyToken, listFollowingController);

export default router;
