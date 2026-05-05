import User from '../models/mysql/User.js';
import Session from '../models/mongodb/Session.js';

export const getUserProfile = async (userId) => {
  return User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  });
};

export const updateUserProfile = async (userId, updateData) => {
  const [updatedRows] = await User.update(updateData, {
    where: { id: userId }
  });

  if (!updatedRows) return null;

  return User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  });
};

export const deleteUserFull = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) return null;

  const deletedUser = await User.destroy({ where: { id: userId } });
  const deletedSessions = await Session.deleteMany({ usuario_id: userId });

  return {
    deletedUser,
    deletedSessions: deletedSessions?.deletedCount ?? 0
  };
};
