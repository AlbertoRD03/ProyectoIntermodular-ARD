import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { isMySQLEnabled } from '../utils/mysqlEnabled.js';
import { createMongoUnavailableError, isMongoConfigured, isMongoConnected } from '../utils/mongodb.js';
import { createHttpError } from '../utils/httpError.js';
import PasswordResetToken from '../models/mongodb/PasswordResetToken.js';
import { sendPasswordResetEmail } from './email.service.js';

export const register = async (userData) => {
  const email = String(userData?.email || '').trim().toLowerCase();
  const nombre = String(userData?.nombre || '').trim();
  const password = String(userData?.password || '');
  const apodo = userData?.apodo ? String(userData.apodo).trim() : '';
  const telefono = userData?.telefono ? String(userData.telefono).trim() : '';

  if (!email || !nombre || !password) {
    throw createHttpError(400, 'Completa todos los campos obligatorios.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (isMySQLEnabled()) {
    const { default: User } = await import('../models/mysql/User.js');
    return await User.create({
      ...userData,
      email,
      nombre,
      apodo,
      telefono,
      password: hashedPassword,
    });
  }

  if (!isMongoConfigured() || !isMongoConnected()) {
    throw createMongoUnavailableError();
  }

  const { default: User } = await import('../models/mongodb/User.js');
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw createHttpError(409, 'El email ya está registrado.');
  }

  const user = await User.create({
    email,
    nombre,
    apodo,
    telefono,
    passwordHash: hashedPassword,
  });

  return user.toJSON();
};

export const login = async (email, password) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const rawPassword = String(password || '');

  if (!normalizedEmail || !rawPassword) {
    throw createHttpError(400, 'Completa todos los campos obligatorios.');
  }

  const jwtSecret = String(process.env.JWT_SECRET || '').trim();
  if (!jwtSecret) {
    throw createHttpError(500, 'Error interno del servidor', { expose: false });
  }

  const invalidCredentialsMessage = 'Usuario o contraseña erroneos.';

  if (isMySQLEnabled()) {
    const { default: User } = await import('../models/mysql/User.js');
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) throw createHttpError(401, invalidCredentialsMessage);

    const isMatch = await bcrypt.compare(rawPassword, user.password);
    if (!isMatch) throw createHttpError(401, invalidCredentialsMessage);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    return { user, token };
  }

  if (!isMongoConfigured() || !isMongoConnected()) {
    throw createMongoUnavailableError();
  }

  const { default: User } = await import('../models/mongodb/User.js');
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) throw createHttpError(401, invalidCredentialsMessage);

  const isMatch = await bcrypt.compare(rawPassword, user.passwordHash);
  if (!isMatch) throw createHttpError(401, invalidCredentialsMessage);

  const token = jwt.sign(
    { id: String(user._id), email: user.email },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );

  return { user: user.toJSON(), token };
};

const sha256Hex = (input) =>
  crypto.createHash('sha256').update(String(input)).digest('hex');

const createResetToken = () => crypto.randomBytes(32).toString('hex');

const getResetUrl = (token) => {
  const base = String(process.env.APP_BASE_URL || '').trim();
  if (!base) return '';
  const normalized = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${normalized}/reset-password?token=${encodeURIComponent(token)}`;
};

export const requestPasswordReset = async ({ email }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) return { exists: false };

  const expiresMinutes = Number.parseInt(process.env.PASSWORD_RESET_EXPIRES_MIN || '30', 10);
  const expiresAt = new Date(Date.now() + Math.max(5, expiresMinutes) * 60 * 1000);

  let user = null;
  let provider = 'mongodb';
  let userId = '';

  if (isMySQLEnabled()) {
    provider = 'mysql';
    const { default: User } = await import('../models/mysql/User.js');
    user = await User.findOne({ where: { email: normalizedEmail } });
    if (user) userId = String(user.id);
  } else {
    provider = 'mongodb';
    if (!isMongoConfigured() || !isMongoConnected()) {
      throw createMongoUnavailableError();
    }
    const { default: User } = await import('../models/mongodb/User.js');
    user = await User.findOne({ email: normalizedEmail });
    if (user) userId = String(user._id);
  }

  // Avoid leaking whether the user exists.
  if (!user) return { exists: false };

  const token = createResetToken();
  const tokenHash = sha256Hex(token);

  // Best-effort cleanup for previous tokens for this user/email.
  await PasswordResetToken.deleteMany({ provider, userId, email: normalizedEmail });
  await PasswordResetToken.create({
    tokenHash,
    provider,
    userId,
    email: normalizedEmail,
    expiresAt
  });

  const resetUrl = getResetUrl(token);
  if (!resetUrl) {
    console.warn(
      `[auth] APP_BASE_URL no configurado. No se puede construir el enlace de reset para ${normalizedEmail}.`
    );
    return;
  }

  await sendPasswordResetEmail({ to: normalizedEmail, resetUrl });
  return { exists: true };
};

export const resetPassword = async ({ token, password }) => {
  const rawToken = String(token || '').trim();
  const newPassword = String(password || '');

  if (!rawToken || !newPassword) throw new Error('Token y contraseña son obligatorios.');
  if (newPassword.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');

  const tokenHash = sha256Hex(rawToken);
  const record = await PasswordResetToken.findOne({ tokenHash });
  if (!record) throw new Error('El enlace no es válido o ha expirado.');
  if (record.usedAt) throw new Error('El enlace ya fue usado.');
  if (record.expiresAt && record.expiresAt.getTime() < Date.now()) {
    throw new Error('El enlace no es válido o ha expirado.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  if (record.provider === 'mysql') {
    const { default: User } = await import('../models/mysql/User.js');
    const user = await User.findByPk(Number(record.userId));
    if (!user) throw new Error('El usuario no existe.');
    user.password = hashedPassword;
    await user.save();
  } else {
    if (!isMongoConfigured() || !isMongoConnected()) {
      throw createMongoUnavailableError();
    }
    const { default: User } = await import('../models/mongodb/User.js');
    const user = await User.findById(record.userId);
    if (!user) throw new Error('El usuario no existe.');
    user.passwordHash = hashedPassword;
    await user.save();
  }

  record.usedAt = new Date();
  await record.save();
  await PasswordResetToken.deleteMany({ provider: record.provider, userId: record.userId });
};
