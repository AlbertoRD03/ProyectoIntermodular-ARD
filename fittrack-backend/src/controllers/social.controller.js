import {
  followUser,
  getPublicProfile,
  listFollowers,
  listFollowing,
  searchUsers,
  unfollowUser
} from '../services/social.service.js';
import { getErrorStatus, shouldExposeErrorMessage } from '../utils/httpError.js';
import { isMySQLEnabled } from '../utils/mysqlEnabled.js';

const fail = (res, error, fallbackMessage) => {
  const status = getErrorStatus(error, 500);
  const message = shouldExposeErrorMessage(error) ? error.message : fallbackMessage;
  return res.status(status).json({ message });
};

export const searchUsersController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });

    const q = req.query?.q;
    const limit = req.query?.limit;
    const users = await searchUsers({ q, limit, excludeUserId: req.user?.id });
    return res.status(200).json({ users });
  } catch (error) {
    return fail(res, error, 'Error al buscar usuarios');
  }
};

export const getPublicProfileController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });

    const targetUserId = req.params?.id;
    const payload = await getPublicProfile({ targetUserId, viewerUserId: req.user?.id });
    return res.status(200).json(payload);
  } catch (error) {
    return fail(res, error, 'Error al obtener el perfil público');
  }
};

export const followUserController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });

    const targetUserId = req.params?.id;
    const result = await followUser({ viewerUserId: req.user?.id, targetUserId });
    return res.status(200).json(result);
  } catch (error) {
    return fail(res, error, 'Error al seguir al usuario');
  }
};

export const unfollowUserController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });

    const targetUserId = req.params?.id;
    const result = await unfollowUser({ viewerUserId: req.user?.id, targetUserId });
    return res.status(200).json(result);
  } catch (error) {
    return fail(res, error, 'Error al dejar de seguir al usuario');
  }
};

export const listFollowersController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });

    const targetUserId = req.params?.id;
    const limit = req.query?.limit;
    const users = await listFollowers({ targetUserId, limit });
    return res.status(200).json({ users });
  } catch (error) {
    return fail(res, error, 'Error al obtener seguidores');
  }
};

export const listFollowingController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });

    const targetUserId = req.params?.id;
    const limit = req.query?.limit;
    const users = await listFollowing({ targetUserId, limit });
    return res.status(200).json({ users });
  } catch (error) {
    return fail(res, error, 'Error al obtener seguidos');
  }
};

