import mongoose from 'mongoose';
import { createHttpError } from '../utils/httpError.js';
import { createMongoUnavailableError, isMongoConfigured, isMongoConnected } from '../utils/mongodb.js';
import { createNotification } from './notification.service.js';

const assertMongoReady = () => {
  if (!isMongoConfigured() || !isMongoConnected()) throw createMongoUnavailableError();
};

const assertObjectId = (value, message = 'ID inválido') => {
  const str = String(value || '').trim();
  if (!mongoose.Types.ObjectId.isValid(str)) throw createHttpError(400, message);
  return str;
};

const toPublicUser = (userDoc) => {
  if (!userDoc) return null;
  return {
    id: String(userDoc._id ?? userDoc.id),
    nombre: userDoc.nombre || '',
    apodo: userDoc.apodo || '',
    photo_url: userDoc.photo_url || '',
  };
};

export const searchUsers = async ({ q, limit = 20, excludeUserId } = {}) => {
  assertMongoReady();
  const { default: User } = await import('../models/mongodb/User.js');

  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
  const query = String(q || '').trim();

  const filters = [];
  if (excludeUserId && mongoose.Types.ObjectId.isValid(String(excludeUserId))) {
    filters.push({ _id: { $ne: new mongoose.Types.ObjectId(String(excludeUserId)) } });
  }

  if (query) {
    const normalized = query.startsWith('@') ? query.slice(1) : query;
    const rx = new RegExp(normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filters.push({
      $or: [{ apodo: rx }, { nombre: rx }, { email: rx }],
    });
  }

  const mongoQuery = filters.length ? { $and: filters } : {};
  const users = await User.find(mongoQuery)
    .select('_id nombre apodo photo_url')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  return users.map(toPublicUser);
};

export const getPublicProfile = async ({ targetUserId, viewerUserId }) => {
  assertMongoReady();
  const targetId = assertObjectId(targetUserId, 'Usuario inválido');
  const viewerId = viewerUserId ? assertObjectId(viewerUserId, 'Usuario inválido') : null;

  const { default: User } = await import('../models/mongodb/User.js');
  const { default: Follow } = await import('../models/mongodb/Follow.js');
  const { default: FitGramPost } = await import('../models/mongodb/FitGramPost.js');

  const user = await User.findById(targetId).select('_id nombre apodo photo_url').lean();
  if (!user) throw createHttpError(404, 'Usuario no encontrado');

  const [followersCount, followingCount, postsCount] = await Promise.all([
    Follow.countDocuments({ followingId: targetId }),
    Follow.countDocuments({ followerId: targetId }),
    FitGramPost.countDocuments({ authorId: targetId }),
  ]);

  let isFollowing = false;
  if (viewerId && viewerId !== targetId) {
    const existing = await Follow.findOne({ followerId: viewerId, followingId: targetId }).lean();
    isFollowing = Boolean(existing);
  }

  return {
    user: toPublicUser(user),
    stats: { followers: followersCount, following: followingCount, posts: postsCount },
    viewer: { isFollowing },
  };
};

export const followUser = async ({ viewerUserId, targetUserId }) => {
  assertMongoReady();
  const viewerId = assertObjectId(viewerUserId, 'Usuario inválido');
  const targetId = assertObjectId(targetUserId, 'Usuario inválido');
  if (viewerId === targetId) throw createHttpError(400, 'No puedes seguirte a ti mismo');

  const { default: User } = await import('../models/mongodb/User.js');
  const { default: Follow } = await import('../models/mongodb/Follow.js');

  const exists = await User.exists({ _id: targetId });
  if (!exists) throw createHttpError(404, 'Usuario no encontrado');

  try {
    const follow = await Follow.create({ followerId: viewerId, followingId: targetId });
    const viewer = await User.findById(viewerId).select('_id nombre apodo').lean();
    const handle = viewer?.apodo || viewer?.nombre || 'Un usuario';
    await createNotification({
      userId: targetId,
      actorId: viewerId,
      type: 'new_follower',
      title: 'Nuevo seguidor',
      message: `@${handle} ha empezado a seguirte.`,
      link: `/fitgram/usuarios/${viewerId}`,
      dedupeKey: `follow:${String(follow._id)}`,
    });
  } catch (err) {
    // Duplicate follow is OK (idempotent).
    if (err?.code !== 11000) throw err;
  }

  return { ok: true };
};

export const unfollowUser = async ({ viewerUserId, targetUserId }) => {
  assertMongoReady();
  const viewerId = assertObjectId(viewerUserId, 'Usuario inválido');
  const targetId = assertObjectId(targetUserId, 'Usuario inválido');
  if (viewerId === targetId) throw createHttpError(400, 'No puedes dejar de seguirte a ti mismo');

  const { default: Follow } = await import('../models/mongodb/Follow.js');
  await Follow.deleteOne({ followerId: viewerId, followingId: targetId });
  return { ok: true };
};

export const listFollowers = async ({ targetUserId, limit = 50 } = {}) => {
  assertMongoReady();
  const targetId = assertObjectId(targetUserId, 'Usuario inválido');
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));

  const { default: Follow } = await import('../models/mongodb/Follow.js');
  const { default: User } = await import('../models/mongodb/User.js');

  const follows = await Follow.find({ followingId: targetId })
    .select('followerId createdAt')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  const ids = follows.map((f) => f.followerId);
  const users = await User.find({ _id: { $in: ids } }).select('_id nombre apodo photo_url').lean();
  const map = new Map(users.map((u) => [String(u._id), toPublicUser(u)]));

  return follows.map((f) => map.get(String(f.followerId))).filter(Boolean);
};

export const listFollowing = async ({ targetUserId, limit = 50 } = {}) => {
  assertMongoReady();
  const targetId = assertObjectId(targetUserId, 'Usuario inválido');
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));

  const { default: Follow } = await import('../models/mongodb/Follow.js');
  const { default: User } = await import('../models/mongodb/User.js');

  const follows = await Follow.find({ followerId: targetId })
    .select('followingId createdAt')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  const ids = follows.map((f) => f.followingId);
  const users = await User.find({ _id: { $in: ids } }).select('_id nombre apodo photo_url').lean();
  const map = new Map(users.map((u) => [String(u._id), toPublicUser(u)]));

  return follows.map((f) => map.get(String(f.followingId))).filter(Boolean);
};
