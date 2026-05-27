import express from 'express';
import { getZones, getWorkoutTypes, getExercises } from '../controllers/catalog.controller.js';

const router = express.Router();

router.get('/zones', getZones);
router.get('/types', getWorkoutTypes);
router.get('/exercises', getExercises);

export default router;

