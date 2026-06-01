import Session from '../models/mongodb/Session.js';
import { isMySQLEnabled } from '../utils/mysqlEnabled.js';

export const getUserProfile = async (userId) => {
  if (isMySQLEnabled()) {
    const { default: User } = await import('../models/mysql/User.js');
    return User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });
  }

  const { default: User } = await import('../models/mongodb/User.js');
  const user = await User.findById(String(userId));
  return user ? user.toJSON() : null;
};

export const updateUserProfile = async (userId, updateData) => {
  const toDateOrUndef = (value) => {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(String(value));
    return Number.isFinite(date.getTime()) ? date : undefined;
  };

  if (isMySQLEnabled()) {
    const { default: User } = await import('../models/mysql/User.js');
    const [updatedRows] = await User.update(updateData, {
      where: { id: userId },
    });

    if (!updatedRows) return null;

    return User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });
  }

  const { default: User } = await import('../models/mongodb/User.js');
  const allowed = {};
  if (typeof updateData?.nombre === 'string') allowed.nombre = updateData.nombre.trim();
  if (typeof updateData?.apodo === 'string') allowed.apodo = updateData.apodo.trim();
  if (typeof updateData?.telefono === 'string') allowed.telefono = updateData.telefono.trim();
  if (typeof updateData?.email === 'string') allowed.email = updateData.email.trim().toLowerCase();
  if (typeof updateData?.genero === 'string') allowed.genero = updateData.genero.trim();
  if (updateData?.fecha_nacimiento) allowed.fecha_nacimiento = toDateOrUndef(updateData.fecha_nacimiento);

  const user = await User.findByIdAndUpdate(String(userId), { $set: allowed }, { new: true });
  return user ? user.toJSON() : null;
};

export const deleteUserFull = async (userId) => {
  if (isMySQLEnabled()) {
    const { default: User } = await import('../models/mysql/User.js');
    const user = await User.findByPk(userId);
    if (!user) return null;

    const deletedUser = await User.destroy({ where: { id: userId } });
    const deletedSessions = await Session.deleteMany({ usuario_id: userId });

    return {
      deletedUser,
      deletedSessions: deletedSessions?.deletedCount ?? 0,
    };
  }

  const { default: User } = await import('../models/mongodb/User.js');
  const deletedUser = await User.findByIdAndDelete(String(userId));
  if (!deletedUser) return null;

  // Session model currently stores usuario_id as Number in schema; keep best-effort delete.
  const deletedSessions = await Session.deleteMany({ usuario_id: userId });

  return {
    deletedUser: 1,
    deletedSessions: deletedSessions?.deletedCount ?? 0,
  };
};

export const completeOnboardingMongo = async (userId, onboardingData) => {
  const { default: User } = await import('../models/mongodb/User.js');

  const toNumberOrUndef = (value) => {
    if (value === null || value === undefined || value === '') return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const toDateOrUndef = (value) => {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(String(value));
    return Number.isFinite(date.getTime()) ? date : undefined;
  };

  const patch = {
    physicalProfile: {
      edad: onboardingData?.edad ?? undefined,
      genero: onboardingData?.genero ?? undefined,
      altura_cm: onboardingData?.altura_cm ?? undefined,
      peso_kg: onboardingData?.peso_kg ?? undefined,
      nivel_actividad: onboardingData?.nivel_actividad ?? undefined,
      objetivo_principal: onboardingData?.objetivo_principal ?? undefined,
      peso_objetivo_kg: toNumberOrUndef(onboardingData?.peso_objetivo_kg ?? onboardingData?.peso_objetivo),
      fecha_objetivo: toDateOrUndef(onboardingData?.fecha_objetivo),
      meta_semanal: onboardingData?.meta_semanal ?? undefined,
      actividad_preferida: onboardingData?.actividad_preferida ?? undefined,
      grasa_pct: toNumberOrUndef(onboardingData?.grasa_pct),
      masa_muscular_kg: toNumberOrUndef(onboardingData?.masa_muscular_kg),
    },
    onboardingCompleted: true,
  };

  const user = await User.findByIdAndUpdate(String(userId), { $set: patch }, { new: true });
  return user ? user.toJSON() : null;
};
