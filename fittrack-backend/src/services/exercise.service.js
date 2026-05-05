import { Op } from 'sequelize';
import Exercise from '../models/mysql/Exercise.js';

export const getExercises = async (filters = {}) => {
  const where = {};

  if (filters.grupo) {
    where.grupo_muscular = filters.grupo;
  }

  if (filters.search) {
    where.nombre = { [Op.like]: `%${filters.search}%` };
  }

  return Exercise.findAll({ where, order: [['nombre', 'ASC']] });
};
