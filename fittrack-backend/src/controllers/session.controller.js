import {
  createSession,
  getSessionsByUser,
  updateSession,
  deleteSession,
  getExerciseHistory
} from '../services/session.service.js';
import { checkAndUnlockAchievements } from '../services/gamificacion.service.js';

export const registrarSesion = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ error: 'Usuario inválido' });
    }

    const {
      tipo_rutina,
      ejercicios_realizados,
      notas,
      duracion_minutos,
      fecha
    } = req.body;

    if (!tipo_rutina) {
      return res.status(400).json({ error: 'Datos de sesión inválidos' });
    }

    const session = await createSession({
      usuario_id: userId,
      fecha: fecha ? new Date(fecha) : new Date(),
      tipo_rutina,
      ejercicios_realizados,
      notas,
      duracion_minutos
    });

    const nuevosLogros = await checkAndUnlockAchievements(userId);

    return res.status(201).json({
      message: 'Sesión registrada con éxito',
      session,
      nuevosLogros
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al registrar la sesión' });
  }
};

export const obtenerHistorial = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ error: 'Usuario inválido' });
    }

    const sessions = await getSessionsByUser(userId);
    return res.status(200).json({ items: sessions });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener historial' });
  }
};

export const actualizarSesion = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ error: 'Usuario inválido' });
    }

    const { id } = req.params;
    const updated = await updateSession(id, userId, req.body);

    if (!updated) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    return res.status(200).json({ message: 'Sesión actualizada', session: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar la sesión' });
  }
};

export const eliminarSesion = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ error: 'Usuario inválido' });
    }

    const { id } = req.params;
    const deleted = await deleteSession(id, userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    return res.status(200).json({ message: 'Sesión eliminada' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar la sesión' });
  }
};

export const obtenerProgresoEjercicio = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const exerciseId = Number(req.params.exerciseId);

    if (!Number.isFinite(userId) || !Number.isFinite(exerciseId)) {
      return res.status(400).json({ error: 'Parámetros inválidos' });
    }

    const history = await getExerciseHistory(userId, exerciseId);

    return res.status(200).json({ items: history });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener progreso del ejercicio' });
  }
};
