import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import {
  createPostController,
  listExploreController,
  listFeedController,
  listUserPostsController
} from '../controllers/fitgram.controller.js';

const router = express.Router();

router.get('/feed', verifyToken, listFeedController);
router.get('/explore', verifyToken, listExploreController);
router.get('/users/:id/posts', verifyToken, listUserPostsController);
router.post('/posts', verifyToken, createPostController);

export default router;

