import {
  register as registerService,
  login as loginService,
  requestPasswordReset as requestPasswordResetService,
  resetPassword as resetPasswordService
} from '../services/auth.service.js';
import { isMySQLDisabledError } from '../utils/mysqlEnabled.js';
import { isMongoUnavailableError } from '../utils/mongodb.js';
import { getErrorStatus, shouldExposeErrorMessage } from '../utils/httpError.js';

const isProduction = () => String(process.env.NODE_ENV || '').toLowerCase() === 'production';

const safeMessage = ({ status, error, fallback }) => {
  if (!isProduction()) return error?.message || fallback;
  if (status >= 500) return fallback;
  if (!shouldExposeErrorMessage(error)) return fallback;
  return error?.message || fallback;
};

const inferStatus = (error, defaultStatus) => {
  const explicit = getErrorStatus(error, NaN);
  if (Number.isInteger(explicit)) return explicit;
  if (isMySQLDisabledError(error) || isMongoUnavailableError(error)) return 503;
  return defaultStatus;
};

export const register = async (req, res) => {
  try {
    const user = await registerService(req.body);
    res.status(201).json({ message: 'Usuario registrado con éxito', user });
  } catch (error) {
    console.error('Error en register:', error);
    const status = inferStatus(error, 400);
    const message = safeMessage({
      status,
      error,
      fallback: status === 503 ? 'Servicio no disponible' : 'Error interno del servidor',
    });
    res.status(status).json({ error: message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginService(email, password);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error en login:', error);
    const status = inferStatus(error, 401);
    const message = safeMessage({
      status,
      error,
      fallback:
        status === 400
          ? 'Datos inválidos'
          : status === 401
            ? 'Usuario o contraseña erroneos.'
            : status === 503
              ? 'Servicio no disponible'
              : 'Error interno del servidor',
    });
    res.status(status).json({ error: message });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'El email es obligatorio.' });
    }

    // Always return 200 to avoid account enumeration.
    await requestPasswordResetService({ email });
    res.status(200).json({ message: 'Si el email existe, te enviaremos un enlace de recuperación.' });
  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    const status = inferStatus(error, 500);
    const message = safeMessage({
      status,
      error,
      fallback: status === 503 ? 'Servicio no disponible' : 'Error interno del servidor',
    });
    return res.status(status).json({ message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const token = String(req.body?.token || '').trim();
    const password = String(req.body?.password || '');
    if (!token || !password) {
      return res.status(400).json({ message: 'Token y contraseña son obligatorios.' });
    }

    await resetPasswordService({ token, password });
    res.status(200).json({ message: 'Contraseña actualizada.' });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    const status = inferStatus(error, 400);
    const message = safeMessage({
      status,
      error,
      fallback: status === 503 ? 'Servicio no disponible' : 'Error interno del servidor',
    });
    res.status(status).json({ error: message });
  }
};
