import { isMySQLEnabled } from '../utils/mysqlEnabled.js';

export const getExercises = async (filters = {}) => {
  if (!isMySQLEnabled()) {
    throw new Error('MySQL desactivado (ENABLE_MYSQL=true para activarlo).');
  }

  const [{ Op }, { default: Exercise }] = await Promise.all([
    import('sequelize'),
    import('../models/mysql/Exercise.js')
  ]);

  const where = {};

  if (filters.grupo) {
    where.grupo_muscular = filters.grupo;
  }

  if (filters.search) {
    where.nombre = { [Op.like]: `%${filters.search}%` };
  }

  return Exercise.findAll({ where, order: [['nombre', 'ASC']] });
};
