import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import {
  listNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', verifyToken, listNotificationsController);
router.patch('/read-all', verifyToken, markAllNotificationsReadController);
router.patch('/:id/read', verifyToken, markNotificationReadController);

export default router;
