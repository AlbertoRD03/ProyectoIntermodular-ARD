import { listZones, listWorkoutTypes, searchExercises } from '../services/catalog.service.js';

export const getZones = async (_req, res) => {
  try {
    const items = await listZones();
    res.status(200).json({ items });
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener zonas' });
  }
};

export const getWorkoutTypes = async (_req, res) => {
  try {
    const items = await listWorkoutTypes();
    res.status(200).json({ items });
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener tipos de entrenamiento' });
  }
};

export const getExercises = async (req, res) => {
  try {
    const search = req.query?.search || req.query?.q || '';
    const zoneKey = req.query?.zoneKey || '';
    const typeKey = req.query?.typeKey || '';
    const limit = req.query?.limit || 50;
    const items = await searchExercises({ search, zoneKey, typeKey, limit });
    res.status(200).json({ items });
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener ejercicios' });
  }
};
