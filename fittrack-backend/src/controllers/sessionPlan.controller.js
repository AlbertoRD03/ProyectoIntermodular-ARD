import { getPlanPreset, getUserSessionPlan, saveUserSessionPlan } from '../services/sessionPlan.service.js';

export const obtenerPlanSesiones = async (req, res) => {
  try {
    const userId = String(req.user?.id || '').trim();
    if (!userId) return res.status(400).json({ error: 'Usuario inválido' });
    const plan = await getUserSessionPlan(userId);
    return res.status(200).json({ plan });
  } catch {
    return res.status(500).json({ error: 'Error al obtener el planificador' });
  }
};

export const guardarPlanSesiones = async (req, res) => {
  try {
    const userId = String(req.user?.id || '').trim();
    if (!userId) return res.status(400).json({ error: 'Usuario inválido' });
    const plan = await saveUserSessionPlan(userId, req.body || {});
    return res.status(200).json({ message: 'Planificador actualizado', plan });
  } catch {
    return res.status(500).json({ error: 'Error al guardar el planificador' });
  }
};

export const obtenerPresetPlanSesiones = async (req, res) => {
  const days = req.query?.days || req.params?.days || 3;
  return res.status(200).json({ preset: getPlanPreset(days) });
};
