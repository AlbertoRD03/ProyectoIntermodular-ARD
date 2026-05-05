import GoalProgress from '../models/mongodb/GoalProgress.js';
import { checkLogros, calculateGoalProgress } from '../services/gamificacion.service.js';
import { isMySQLEnabled, isMySQLDisabledError } from '../utils/mysqlEnabled.js';

export const listLogros = async (req, res) => {
  try {
    if (!isMySQLEnabled()) {
      return res.status(503).json({ error: 'MySQL desactivado' });
    }

    const { Achievement, UserAchievement } = await import('../models/mysql/index.js');
    const userId = req.user.id;
    await checkLogros(userId);

    const logros = await UserAchievement.findAll({
      where: { user_id: userId },
      include: [{ model: Achievement }],
      order: [['fecha_desbloqueo', 'DESC']]
    });

    res.status(200).json({ items: logros });
  } catch (error) {
    const status = isMySQLDisabledError(error) ? 503 : 500;
    res.status(status).json({ error: isMySQLDisabledError(error) ? error.message : 'Error al obtener logros' });
  }
};

export const createGoal = async (req, res) => {
  try {
    if (!isMySQLEnabled()) {
      return res.status(503).json({ error: 'MySQL desactivado' });
    }

    const { PersonalGoal } = await import('../models/mysql/index.js');
    const userId = req.user.id;
    const { tipo, valor_inicial, valor_objetivo, unidad, fecha_limite } = req.body;

    if (!tipo || valor_inicial === undefined || valor_objetivo === undefined || !unidad) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const goal = await PersonalGoal.create({
      usuario_id: userId,
      tipo,
      valor_inicial,
      valor_objetivo,
      unidad,
      fecha_limite
    });

    res.status(201).json({ message: 'Objetivo creado con éxito', goal });
  } catch (error) {
    const status = isMySQLDisabledError(error) ? 503 : 500;
    res.status(status).json({ error: isMySQLDisabledError(error) ? error.message : 'Error al crear el objetivo' });
  }
};

export const registerGoalProgress = async (req, res) => {
  try {
    if (!isMySQLEnabled()) {
      return res.status(503).json({ error: 'MySQL desactivado' });
    }

    const { PersonalGoal } = await import('../models/mysql/index.js');
    const userId = req.user.id;
    const goalId = Number(req.params.id);
    const { valor_registrado, fecha } = req.body;

    if (!goalId || valor_registrado === undefined) {
      return res.status(400).json({ error: 'Datos de progreso inválidos' });
    }

    const goal = await PersonalGoal.findOne({
      where: { id: goalId, usuario_id: userId }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Objetivo no encontrado' });
    }

    const progress = await GoalProgress.create({
      objetivo_id: goalId,
      usuario_id: userId,
      valor_registrado,
      fecha: fecha ? new Date(fecha) : new Date()
    });

    const progressInfo = await calculateGoalProgress(goalId);

    res.status(201).json({
      message: 'Progreso registrado con éxito',
      progress,
      progressInfo
    });
  } catch (error) {
    const status = isMySQLDisabledError(error) ? 503 : 500;
    res.status(status).json({ error: isMySQLDisabledError(error) ? error.message : 'Error al registrar progreso' });
  }
};
