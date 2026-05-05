import { User, Achievement, UserAchievement, PersonalGoal } from '../models/mysql/index.js';
import Session from '../models/mongodb/Session.js';
import GoalProgress from '../models/mongodb/GoalProgress.js';

const LOGROS_REGLAS = [
  {
    clave: '5-sesiones',
    nombre: 'Constancia',
    descripcion: 'Completa 5 sesiones de entrenamiento',
    categoria: 'Sesiones',
    threshold: 5
  }
];

const ACHIEVEMENT_RULES = [
  {
    id: 1,
    nombre: 'Primer Paso',
    descripcion: 'Completa tu primera sesión',
    categoria: 'Sesiones',
    threshold: 1
  },
  {
    id: 2,
    nombre: 'Constancia de Hierro',
    descripcion: 'Completa 5 sesiones de entrenamiento',
    categoria: 'Sesiones',
    threshold: 5
  },
  {
    id: 3,
    nombre: 'Guerrero de Élite',
    descripcion: 'Completa 20 sesiones de entrenamiento',
    categoria: 'Sesiones',
    threshold: 20
  }
];

export const checkLogros = async (userId) => {
  if (!userId) throw new Error('userId requerido');

  const sessionCount = await Session.countDocuments({ usuario_id: userId });
  const unlocked = [];

  for (const regla of LOGROS_REGLAS) {
    if (sessionCount < regla.threshold) continue;

    const [achievement] = await Achievement.findOrCreate({
      where: { nombre: regla.nombre },
      defaults: {
        descripcion: regla.descripcion,
        categoria: regla.categoria
      }
    });

    const [, created] = await UserAchievement.findOrCreate({
      where: { user_id: userId, achievement_id: achievement.id },
      defaults: { fecha_desbloqueo: new Date() }
    });

    if (created) unlocked.push(achievement);
  }

  return unlocked;
};

export const checkAndUnlockAchievements = async (userId) => {
  if (!userId) throw new Error('userId requerido');

  const [totalSesiones, user] = await Promise.all([
    Session.countDocuments({ usuario_id: userId }),
    User.findByPk(userId, {
      include: [{ model: Achievement }]
    })
  ]);

  if (!user) throw new Error('Usuario no encontrado');

  const existingIds = new Set(
    (user.Achievements || []).map((achievement) => achievement.id)
  );

  const unlocked = [];

  for (const rule of ACHIEVEMENT_RULES) {
    if (totalSesiones < rule.threshold) continue;
    if (existingIds.has(rule.id)) continue;

    const [achievement] = await Achievement.findOrCreate({
      where: { id: rule.id },
      defaults: {
        nombre: rule.nombre,
        descripcion: rule.descripcion,
        categoria: rule.categoria
      }
    });

    await user.addAchievement(achievement);
    unlocked.push(achievement);
  }

  return unlocked;
};

export const calculateGoalProgress = async (goalId) => {
  if (!goalId) throw new Error('goalId requerido');

  const [goal, progressDocs] = await Promise.all([
    PersonalGoal.findByPk(goalId),
    GoalProgress.find({ objetivo_id: goalId }).sort({ fecha: -1 })
  ]);

  if (!goal) throw new Error('Objetivo no encontrado');

  const start = Number(goal.valor_inicial);
  const target = Number(goal.valor_objetivo);
  const latestProgress = progressDocs[0];
  const currentValue = latestProgress
    ? Number(latestProgress.valor_registrado)
    : start;

  const totalDelta = target - start;
  let progressPercent = totalDelta === 0
    ? 100
    : ((currentValue - start) / totalDelta) * 100;

  if (!Number.isFinite(progressPercent)) progressPercent = 0;
  progressPercent = Math.max(0, Math.min(100, progressPercent));

  return {
    goal,
    currentValue,
    progressPercent: Number(progressPercent.toFixed(2))
  };
};
