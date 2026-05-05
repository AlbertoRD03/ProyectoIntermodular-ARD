import Session from '../models/mongodb/Session.js';
import { isMySQLEnabled } from '../utils/mysqlEnabled.js';

export const getUserProfile = async (userId) => {
  if (!isMySQLEnabled()) {
    throw new Error('MySQL desactivado (ENABLE_MYSQL=true para activarlo).');
  }

  const { default: User } = await import('../models/mysql/User.js');
  return User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  });
};

export const updateUserProfile = async (userId, updateData) => {
  if (!isMySQLEnabled()) {
    throw new Error('MySQL desactivado (ENABLE_MYSQL=true para activarlo).');
  }

  const { default: User } = await import('../models/mysql/User.js');
  const [updatedRows] = await User.update(updateData, {
    where: { id: userId }
  });

  if (!updatedRows) return null;

  return User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  });
};

export const deleteUserFull = async (userId) => {
  if (!isMySQLEnabled()) {
    throw new Error('MySQL desactivado (ENABLE_MYSQL=true para activarlo).');
  }

  const { default: User } = await import('../models/mysql/User.js');
  const user = await User.findByPk(userId);
  if (!user) return null;

  const deletedUser = await User.destroy({ where: { id: userId } });
  const deletedSessions = await Session.deleteMany({ usuario_id: userId });

  return {
    deletedUser,
    deletedSessions: deletedSessions?.deletedCount ?? 0
  };
};
