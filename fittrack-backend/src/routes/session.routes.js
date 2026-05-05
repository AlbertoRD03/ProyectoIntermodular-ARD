import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import checkOnboarding from '../middlewares/checkOnboarding.middleware.js';
import {
  registrarSesion,
  obtenerHistorial,
  actualizarSesion,
  eliminarSesion,
  obtenerProgresoEjercicio
} from '../controllers/session.controller.js';

const router = express.Router();

router.post('/', verifyToken, checkOnboarding, registrarSesion);
router.get('/historial', verifyToken, checkOnboarding, obtenerHistorial);
router.get('/ejercicio/:exerciseId', verifyToken, checkOnboarding, obtenerProgresoEjercicio);
router.put('/:id', verifyToken, checkOnboarding, actualizarSesion);
router.delete('/:id', verifyToken, checkOnboarding, eliminarSesion);

export default router;
