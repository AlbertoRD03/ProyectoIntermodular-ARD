import User from '../models/mysql/User.js';

const checkOnboarding = async (req, res, next) => {
  try {
    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ error: 'Usuario inválido' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!user.onboarding_completado) {
      return res.status(403).json({ error: 'Onboarding pendiente' });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Error al validar onboarding' });
  }
};

export default checkOnboarding;
