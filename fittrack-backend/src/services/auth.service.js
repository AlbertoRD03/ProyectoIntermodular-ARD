import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { isMySQLEnabled } from '../utils/mysqlEnabled.js';

export const register = async (userData) => {
  if (!isMySQLEnabled()) {
    throw new Error('MySQL desactivado (ENABLE_MYSQL=true para activarlo).');
  }

  const { default: User } = await import('../models/mysql/User.js');
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  return await User.create({
    ...userData,
    password: hashedPassword
  });
};

export const login = async (email, password) => {
  if (!isMySQLEnabled()) {
    throw new Error('MySQL desactivado (ENABLE_MYSQL=true para activarlo).');
  }

  const { default: User } = await import('../models/mysql/User.js');
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Usuario no encontrado');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Contraseña incorrecta');

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { user, token };
};
