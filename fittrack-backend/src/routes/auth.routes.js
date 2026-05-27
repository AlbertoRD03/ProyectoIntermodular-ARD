import express from 'express';
import { register, login, requestPasswordReset, resetPassword } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/password/forgot', requestPasswordReset);
router.post('/password/reset', resetPassword);

export default router;
