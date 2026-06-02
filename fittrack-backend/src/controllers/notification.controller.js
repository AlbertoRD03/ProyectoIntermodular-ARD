import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notification.service.js';
import { getErrorStatus, shouldExposeErrorMessage } from '../utils/httpError.js';

const fail = (res, error, fallbackMessage) => {
  const status = getErrorStatus(error, 500);
  const message = shouldExposeErrorMessage(error) ? error.message : fallbackMessage;
  return res.status(status).json({ message });
};

export const listNotificationsController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = req.query?.limit;
    const unreadOnly = String(req.query?.unread || '').toLowerCase() === 'true';
    const result = await listNotifications({ userId, limit, unreadOnly });
    return res.status(200).json(result);
  } catch (error) {
    return fail(res, error, 'Error al cargar notificaciones');
  }
};

export const markNotificationReadController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params?.id;
    const notification = await markNotificationRead({ userId, notificationId });
    return res.status(200).json({ notification });
  } catch (error) {
    return fail(res, error, 'Error al actualizar la notificación');
  }
};

export const markAllNotificationsReadController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await markAllNotificationsRead({ userId });
    return res.status(200).json(result);
  } catch (error) {
    return fail(res, error, 'Error al actualizar notificaciones');
  }
};
