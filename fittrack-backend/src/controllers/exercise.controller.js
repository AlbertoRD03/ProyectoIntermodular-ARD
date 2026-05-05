import { getExercises } from '../services/exercise.service.js';

export const getAllExercises = async (req, res) => {
  try {
    const { grupo, search } = req.query;
    const exercises = await getExercises({ grupo, search });
    return res.status(200).json({ items: exercises });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener ejercicios' });
  }
};
