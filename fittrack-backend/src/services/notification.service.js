import mongoose from 'mongoose';
import { createHttpError } from '../utils/httpError.js';
import { createMongoUnavailableError, isMongoConfigured, isMongoConnected } from '../utils/mongodb.js';

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

const normalizeNotification = (notification, actorMap = new Map()) => ({
  id: String(notification._id || notification.id),
  type: notification.type,
  title: notification.title,
  message: notification.message,
  link: notification.link || '',
  metadata: notification.metadata || {},
  readAt: notification.readAt || null,
  createdAt: notification.createdAt,
  actor: notification.actorId ? actorMap.get(String(notification.actorId)) || null : null,
});

export const createNotification = async ({
  userId,
  actorId,
  type,
  title,
  message,
  link = '',
  metadata,
  dedupeKey,
}) => {
  assertMongoReady();
  const recipientId = assertObjectId(userId, 'Usuario inválido');
  const actorObjectId = actorId && mongoose.Types.ObjectId.isValid(String(actorId)) ? String(actorId) : undefined;
  if (actorObjectId && actorObjectId === recipientId) return null;

  const { default: Notification } = await import('../models/mongodb/Notification.js');
  try {
    return await Notification.create({
      userId: recipientId,
      actorId: actorObjectId,
      type,
      title: String(title || '').trim().slice(0, 120),
      message: String(message || '').trim().slice(0, 300),
      link: String(link || '').trim().slice(0, 300),
      metadata,
      dedupeKey: dedupeKey ? String(dedupeKey).trim().slice(0, 160) : undefined,
    });
  } catch (error) {
    if (error?.code === 11000) return null;
    throw error;
  }
};

export const ensurePhysicalDataReminder = async ({ userId }) => {
  assertMongoReady();
  const recipientId = assertObjectId(userId, 'Usuario inválido');
  const { default: User } = await import('../models/mongodb/User.js');
  const user = await User.findById(recipientId).select('physicalProfile').lean();
  const profile = user?.physicalProfile || {};
  const missingBodyStats = !profile.grasa_pct || !profile.masa_muscular_kg || !profile.peso_objetivo_kg;
  if (!missingBodyStats) return null;

  const dayKey = new Date().toISOString().slice(0, 10);
  return createNotification({
    userId: recipientId,
    type: 'physical_data_reminder',
    title: 'Actualiza tus datos físicos',
    message: 'Completa peso objetivo, grasa corporal y masa muscular para mejorar tus recomendaciones.',
    link: '/perfil',
    dedupeKey: `physical-data:${recipientId}:${dayKey}`,
  });
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getTodayDayIndex = () => {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
};

export const ensurePlannerReminder = async ({ userId }) => {
  assertMongoReady();
  const recipientId = assertObjectId(userId, 'Usuario inválido');
  const { default: SessionPlan } = await import('../models/mongodb/SessionPlan.js');
  const plan = await SessionPlan.findOne({ userId: recipientId }).lean();
  const session = (Array.isArray(plan?.sessions) ? plan.sessions : []).find((item) => Number(item?.dayIndex) === getTodayDayIndex());
  if (!session?.title) return null;

  const dayKey = getTodayKey();
  const title = String(session.title || 'entreno').trim();
  return createNotification({
    userId: recipientId,
    type: 'planner_reminder',
    title: 'Entreno planificado para hoy',
    message: `Hoy te toca ${title}. Dale duro para ponerte como un toro.`,
    link: `/crear-sesion?date=${dayKey}`,
    metadata: { dayKey, plannedTitle: title },
    dedupeKey: `planner:${recipientId}:${dayKey}`,
  });
};

export const listNotifications = async ({ userId, limit = 50, unreadOnly = false } = {}) => {
  assertMongoReady();
  const recipientId = assertObjectId(userId, 'Usuario inválido');
  await Promise.all([
    ensurePhysicalDataReminder({ userId: recipientId }),
    ensurePlannerReminder({ userId: recipientId }),
  ]);

  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
  const { default: Notification } = await import('../models/mongodb/Notification.js');
  const { default: User } = await import('../models/mongodb/User.js');
  const query = { userId: recipientId, type: { $ne: 'challenge_request' } };
  if (unreadOnly) query.readAt = { $exists: false };

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).limit(safeLimit).lean(),
    Notification.countDocuments({ userId: recipientId, type: { $ne: 'challenge_request' }, readAt: { $exists: false } }),
  ]);

  const actorIds = Array.from(new Set(notifications.map((item) => String(item.actorId || '')).filter(Boolean)));
  const actors = actorIds.length
    ? await User.find({ _id: { $in: actorIds } }).select('_id nombre apodo photo_url').lean()
    : [];
  const actorMap = new Map(actors.map((actor) => [String(actor._id), toPublicUser(actor)]));

  return {
    unreadCount,
    items: notifications.map((item) => normalizeNotification(item, actorMap)),
  };
};

export const markNotificationRead = async ({ userId, notificationId }) => {
  assertMongoReady();
  const recipientId = assertObjectId(userId, 'Usuario inválido');
  const id = assertObjectId(notificationId, 'Notificación inválida');
  const { default: Notification } = await import('../models/mongodb/Notification.js');
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: recipientId },
    { $set: { readAt: new Date() } },
    { new: true }
  ).lean();
  if (!notification) throw createHttpError(404, 'Notificación no encontrada');
  return normalizeNotification(notification);
};

export const markAllNotificationsRead = async ({ userId }) => {
  assertMongoReady();
  const recipientId = assertObjectId(userId, 'Usuario inválido');
  const { default: Notification } = await import('../models/mongodb/Notification.js');
  const result = await Notification.updateMany(
    { userId: recipientId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } }
  );
  return { updated: result.modifiedCount || 0 };
};
