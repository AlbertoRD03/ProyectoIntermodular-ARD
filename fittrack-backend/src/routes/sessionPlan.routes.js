import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import checkOnboarding from '../middlewares/checkOnboarding.middleware.js';
import { guardarPlanSesiones, obtenerPlanSesiones, obtenerPresetPlanSesiones } from '../controllers/sessionPlan.controller.js';

const router = express.Router();

router.get('/', verifyToken, checkOnboarding, obtenerPlanSesiones);
router.put('/', verifyToken, checkOnboarding, guardarPlanSesiones);
router.get('/preset', verifyToken, checkOnboarding, obtenerPresetPlanSesiones);

export default router;
