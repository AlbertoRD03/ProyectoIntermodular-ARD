import { isMySQLEnabled } from '../utils/mysqlEnabled.js';

export const getExercises = async (filters = {}) => {
  if (!isMySQLEnabled()) {
    const { searchExercises } = await import('./catalog.service.js');
    const zoneKey = filters.grupo ? String(filters.grupo) : '';
    const search = filters.search ? String(filters.search) : '';
    // Map legacy `grupo` filter (which was muscle group name) to a catalog key if it matches.
    // If not, it will just return no matches unless `search` is used.
    const items = await searchExercises({ search, zoneKey });
    // Shape similar to sequelize model fields used by the UI (nombre + grupo_muscular).
    return items.map((x) => ({
      id: String(x._id),
      nombre: x.nombre,
      grupo_muscular: Array.isArray(x.zoneKeys) ? x.zoneKeys[0] : undefined
    }));
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
