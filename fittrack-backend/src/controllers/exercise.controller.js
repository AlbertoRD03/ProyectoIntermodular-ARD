import { getExercises } from '../services/exercise.service.js';
import { isMySQLDisabledError } from '../utils/mysqlEnabled.js';

export const getAllExercises = async (req, res) => {
  try {
    const { grupo, search } = req.query;
    const exercises = await getExercises({ grupo, search });
    return res.status(200).json({ items: exercises });
  } catch (error) {
    const status = isMySQLDisabledError(error) ? 503 : 500;
    return res.status(status).json({ error: isMySQLDisabledError(error) ? error.message : 'Error al obtener ejercicios' });
  }
};
