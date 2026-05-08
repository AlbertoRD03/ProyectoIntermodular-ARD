import {
  getUserProfile,
  updateUserProfile,
  deleteUserFull,
  completeOnboardingMongo
} from '../services/user.service.js';
import { isMySQLEnabled, isMySQLDisabledError } from '../utils/mysqlEnabled.js';

export const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    if (isMySQLEnabled()) {
      const { default: User } = await import('../models/mysql/User.js');
      const {
        fecha_nacimiento,
        genero,
        altura_cm,
        peso_kg,
        nivel_experiencia,
        objetivo_principal,
      } = req.body;

      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

      await user.update({
        fecha_nacimiento,
        genero,
        altura_cm,
        peso_kg,
        nivel_experiencia,
        objetivo_principal,
        onboarding_completado: true,
      });

      return res.status(200).json({ message: 'Onboarding completado con éxito', user });
    }

    const user = await completeOnboardingMongo(userId, req.body);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    return res.status(200).json({ message: 'Onboarding completado con éxito', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'Usuario inválido' });
    }

    const user = await getUserProfile(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    return res.status(200).json({ user });
  } catch (error) {
    const status = isMySQLDisabledError(error) ? 503 : 500;
    return res.status(status).json({ message: isMySQLDisabledError(error) ? error.message : 'Error al obtener el perfil' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'Usuario inválido' });
    }

    const updatedUser = await updateUserProfile(userId, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ message: 'Perfil actualizado', user: updatedUser });
  } catch (error) {
    const status = isMySQLDisabledError(error) ? 503 : 500;
    return res.status(status).json({ message: isMySQLDisabledError(error) ? error.message : 'Error al actualizar el perfil' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'Usuario inválido' });
    }

    const result = await deleteUserFull(userId);
    if (!result) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      message: 'Cuenta eliminada permanentemente',
      result
    });
  } catch (error) {
    const status = isMySQLDisabledError(error) ? 503 : 500;
    return res.status(status).json({ message: isMySQLDisabledError(error) ? error.message : 'Error al eliminar la cuenta' });
  }
};
