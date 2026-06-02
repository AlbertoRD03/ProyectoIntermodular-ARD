import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import {
  addCommentController,
  createPostController,
  deletePostController,
  listExploreController,
  listFeedController,
  listUserPostsController,
  updatePostController
} from '../controllers/fitgram.controller.js';

const router = express.Router();

router.get('/feed', verifyToken, listFeedController);
router.get('/explore', verifyToken, listExploreController);
router.get('/users/:id/posts', verifyToken, listUserPostsController);
router.post('/posts', verifyToken, createPostController);
router.patch('/posts/:id', verifyToken, updatePostController);
router.delete('/posts/:id', verifyToken, deletePostController);
router.post('/posts/:id/comments', verifyToken, addCommentController);

export default router;
