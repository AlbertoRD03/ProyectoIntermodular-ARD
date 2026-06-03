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

const normalizeType = (type) => {
  const value = String(type || '').trim();
  return ['volume', 'sessions', 'duration', 'exercise_max'].includes(value) ? value : 'volume';
};

const normalizeChallenge = (challenge, userMap = new Map()) => ({
  id: String(challenge._id || challenge.id),
  creatorId: String(challenge.creatorId),
  targetId: String(challenge.targetId),
  creator: userMap.get(String(challenge.creatorId)) || null,
  target: userMap.get(String(challenge.targetId)) || null,
  title: challenge.title || '',
  description: challenge.description || '',
  type: challenge.type,
  targetValue: Number(challenge.targetValue || 0),
  unit: challenge.unit || '',
  exerciseName: challenge.exerciseName || '',
  deadline: challenge.deadline || null,
  status: challenge.status || 'pending',
  acceptedAt: challenge.acceptedAt || null,
  completedAt: challenge.completedAt || null,
  createdAt: challenge.createdAt,
  updatedAt: challenge.updatedAt,
});

const attachUsers = async (challenges) => {
  const ids = Array.from(new Set(challenges.flatMap((challenge) => [
    String(challenge.creatorId || ''),
    String(challenge.targetId || ''),
  ]).filter(Boolean)));
  if (!ids.length) return challenges.map((challenge) => normalizeChallenge(challenge));

  const { default: User } = await import('../models/mongodb/User.js');
  const users = await User.find({ _id: { $in: ids } }).select('_id nombre apodo photo_url').lean();
  const userMap = new Map(users.map((user) => [String(user._id), toPublicUser(user)]));
  return challenges.map((challenge) => normalizeChallenge(challenge, userMap));
};

export const createChallenge = async ({ creatorId, targetId, title, description, type, targetValue, unit, exerciseName, deadline }) => {
  assertMongoReady();
  const safeCreatorId = assertObjectId(creatorId, 'Usuario inválido');
  const safeTargetId = assertObjectId(targetId, 'Usuario retado inválido');
  if (safeCreatorId === safeTargetId) throw createHttpError(400, 'No puedes retarte a ti mismo');

  const safeTitle = String(title || '').trim().slice(0, 120);
  if (!safeTitle) throw createHttpError(400, 'El título es obligatorio');
  const safeTargetValue = Number(targetValue);
  if (!Number.isFinite(safeTargetValue) || safeTargetValue <= 0) throw createHttpError(400, 'La meta debe ser mayor que 0');
  const safeType = normalizeType(type);
  const safeExerciseName = safeType === 'exercise_max' ? String(exerciseName || '').trim().slice(0, 120) : '';
  if (safeType === 'exercise_max' && !safeExerciseName) throw createHttpError(400, 'El ejercicio es obligatorio para este reto');

  const { default: User } = await import('../models/mongodb/User.js');
  const { default: Follow } = await import('../models/mongodb/Follow.js');
  const { default: Challenge } = await import('../models/mongodb/Challenge.js');

  const [targetUser, creatorUser, following] = await Promise.all([
    User.findById(safeTargetId).select('_id nombre apodo').lean(),
    User.findById(safeCreatorId).select('_id nombre apodo').lean(),
    Follow.findOne({ followerId: safeCreatorId, followingId: safeTargetId }).lean(),
  ]);
  if (!targetUser) throw createHttpError(404, 'Usuario retado no encontrado');
  if (!following) throw createHttpError(403, 'Solo puedes retar a usuarios que sigues en FitGram');

  const parsedDeadline = deadline ? new Date(deadline) : undefined;
  const challenge = await Challenge.create({
    creatorId: safeCreatorId,
    targetId: safeTargetId,
    title: safeTitle,
    description: String(description || '').trim().slice(0, 400),
    type: safeType,
    targetValue: safeTargetValue,
    unit: String(unit || '').trim().slice(0, 20),
    exerciseName: safeExerciseName,
    deadline: parsedDeadline && !Number.isNaN(parsedDeadline.getTime()) ? parsedDeadline : undefined,
    status: 'pending',
  });

  const creatorName = creatorUser?.apodo || creatorUser?.nombre || 'Un usuario';
  await createNotification({
    userId: safeTargetId,
    actorId: safeCreatorId,
    type: 'challenge_request',
    title: 'Nuevo reto',
    message: `@${creatorName} te ha retado: "${safeTitle}".`,
    link: '/retos?tab=requests',
    metadata: { challengeId: String(challenge._id) },
    dedupeKey: `challenge:${String(challenge._id)}`,
  });

  const [withUsers] = await attachUsers([challenge.toObject()]);
  return withUsers;
};

export const listChallenges = async ({ userId, status } = {}) => {
  assertMongoReady();
  const safeUserId = assertObjectId(userId, 'Usuario inválido');
  const query = { $or: [{ creatorId: safeUserId }, { targetId: safeUserId }] };
  if (status && ['pending', 'accepted', 'declined', 'completed'].includes(String(status))) {
    query.status = String(status);
  }

  const { default: Challenge } = await import('../models/mongodb/Challenge.js');
  const challenges = await Challenge.find(query).sort({ createdAt: -1 }).limit(120).lean();
  return attachUsers(challenges);
};

export const updateChallengeStatus = async ({ userId, challengeId, status }) => {
  assertMongoReady();
  const safeUserId = assertObjectId(userId, 'Usuario inválido');
  const safeChallengeId = assertObjectId(challengeId, 'Reto inválido');
  const safeStatus = String(status || '').trim();
  if (!['accepted', 'declined', 'completed'].includes(safeStatus)) throw createHttpError(400, 'Estado inválido');

  const { default: Challenge } = await import('../models/mongodb/Challenge.js');
  const challenge = await Challenge.findById(safeChallengeId).lean();
  if (!challenge) throw createHttpError(404, 'Reto no encontrado');

  const isTarget = String(challenge.targetId) === safeUserId;
  const isCreator = String(challenge.creatorId) === safeUserId;
  if (!isTarget && !isCreator) throw createHttpError(403, 'No tienes permisos para modificar este reto');
  if ((safeStatus === 'accepted' || safeStatus === 'declined') && !isTarget) {
    throw createHttpError(403, 'Solo el usuario retado puede responder la solicitud');
  }

  const patch = { status: safeStatus };
  if (safeStatus === 'accepted') patch.acceptedAt = new Date();
  if (safeStatus === 'completed') patch.completedAt = new Date();

  const updated = await Challenge.findByIdAndUpdate(safeChallengeId, patch, { new: true }).lean();
  const [withUsers] = await attachUsers([updated]);
  return withUsers;
};
