import mongoose from 'mongoose';

export const isMongoConfigured = () => Boolean(String(process.env.MONGO_URI || '').trim());

export const isMongoConnected = () => mongoose.connection?.readyState === 1;

export const createMongoUnavailableError = (detail = '') => {
  const error = new Error(detail || 'Servicio de base de datos no disponible.');
  error.name = 'MongoUnavailableError';
  error.status = 503;
  error.expose = false;
  return error;
};

export const isMongoUnavailableError = (error) =>
  Boolean(error?.name === 'MongoUnavailableError' || error?.status === 503);

