import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isMySQLEnabled } from '../utils/mysqlEnabled.js';

export const register = async (userData) => {
  const email = String(userData?.email || '').trim().toLowerCase();
  const nombre = String(userData?.nombre || '').trim();
  const password = String(userData?.password || '');
  const apodo = userData?.apodo ? String(userData.apodo).trim() : '';
  const telefono = userData?.telefono ? String(userData.telefono).trim() : '';

  if (!email || !nombre || !password) {
    throw new Error('Completa todos los campos obligatorios.');
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

  const { default: User } = await import('../models/mongodb/User.js');
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw new Error('El email ya está registrado.');
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
    throw new Error('Completa todos los campos obligatorios.');
  }

  if (isMySQLEnabled()) {
    const { default: User } = await import('../models/mysql/User.js');
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) throw new Error('Usuario no encontrado');

    const isMatch = await bcrypt.compare(rawPassword, user.password);
    if (!isMatch) throw new Error('Contraseña incorrecta');

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    return { user, token };
  }

  const { default: User } = await import('../models/mongodb/User.js');
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) throw new Error('Usuario no encontrado');

  const isMatch = await bcrypt.compare(rawPassword, user.passwordHash);
  if (!isMatch) throw new Error('Contraseña incorrecta');

  const token = jwt.sign(
    { id: String(user._id), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );

  return { user: user.toJSON(), token };
};
