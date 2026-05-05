import {
  getWeeklyWorkload,
  getMuscleDistribution,
  getLifetimeStats
} from '../services/dashboard.service.js';

export const getFullStats = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ error: 'Usuario inválido' });
    }

    const [weeklyWorkload, muscleDistribution, lifetimeStats] = await Promise.all([
      getWeeklyWorkload(userId),
      getMuscleDistribution(userId),
      getLifetimeStats(userId)
    ]);

    return res.status(200).json({
      weeklyWorkload,
      muscleDistribution,
      lifetimeStats
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
