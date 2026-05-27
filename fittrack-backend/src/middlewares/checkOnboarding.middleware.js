import { isMySQLEnabled } from '../utils/mysqlEnabled.js';

const isOnboardingRequired = () =>
  String(process.env.REQUIRE_ONBOARDING || '').trim().toLowerCase() === 'true';

const checkOnboarding = async (req, res, next) => {
  try {
    const rawUserId = req.user?.id;
    if (rawUserId === undefined || rawUserId === null || String(rawUserId).trim() === '') {
      return res.status(400).json({ error: 'Usuario inválido' });
    }

    if (isMySQLEnabled()) {
      const { default: User } = await import('../models/mysql/User.js');
      const userId = Number(rawUserId);
      if (!Number.isFinite(userId)) {
        return res.status(400).json({ error: 'Usuario inválido' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (isOnboardingRequired() && !user.onboarding_completado) {
        return res.status(403).json({ error: 'Onboarding pendiente' });
      }

      return next();
    }

    const { default: User } = await import('../models/mongodb/User.js');
    const user = await User.findById(String(rawUserId).trim());
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (isOnboardingRequired() && !user.onboardingCompleted) {
      return res.status(403).json({ error: 'Onboarding pendiente' });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Error al validar onboarding' });
  }
};

export default checkOnboarding;
