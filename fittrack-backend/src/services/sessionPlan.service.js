import mongoose from 'mongoose';
import { createHttpError } from '../utils/httpError.js';
import { createMongoUnavailableError, isMongoConfigured, isMongoConnected } from '../utils/mongodb.js';

const assertMongoReady = () => {
  if (!isMongoConfigured() || !isMongoConnected()) throw createMongoUnavailableError();
};

const assertObjectId = (value, message = 'Usuario inválido') => {
  const str = String(value || '').trim();
  if (!mongoose.Types.ObjectId.isValid(str)) throw createHttpError(400, message);
  return str;
};

const clampTrainingDays = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 3;
  return Math.min(7, Math.max(1, Math.round(n)));
};

const PRESETS = {
  1: [
    { dayIndex: 1, title: 'Full body', zoneKeys: ['full_body'], exercises: ['Sentadilla', 'Press banca plano', 'Remo con barra', 'Press militar'] },
  ],
  2: [
    { dayIndex: 1, title: 'Tren superior', zoneKeys: ['chest', 'back', 'shoulders', 'arms'], exercises: ['Press banca plano', 'Jalón al pecho', 'Press militar', 'Curl de bíceps con barra'] },
    { dayIndex: 4, title: 'Tren inferior', zoneKeys: ['legs', 'glutes', 'calves'], exercises: ['Sentadilla', 'Prensa de piernas', 'Peso muerto rumano', 'Elevación de gemelos de pie'] },
  ],
  3: [
    { dayIndex: 1, title: 'Pecho + hombro + tríceps', zoneKeys: ['chest', 'shoulders', 'triceps'], exercises: ['Press banca plano', 'Press inclinado con mancuernas', 'Press militar', 'Extensión de tríceps en polea'] },
    { dayIndex: 3, title: 'Espalda + bíceps', zoneKeys: ['back', 'biceps'], exercises: ['Dominadas', 'Remo con barra', 'Jalón al pecho', 'Curl de bíceps con mancuernas'] },
    { dayIndex: 5, title: 'Pierna + abdomen', zoneKeys: ['legs', 'glutes', 'abs'], exercises: ['Sentadilla', 'Hip thrust', 'Curl femoral', 'Plancha'] },
  ],
  4: [
    { dayIndex: 1, title: 'Pecho + tríceps', zoneKeys: ['chest', 'triceps'], exercises: ['Press banca plano', 'Press banca inclinado', 'Aperturas con mancuernas', 'Extensión de tríceps con cuerda'] },
    { dayIndex: 2, title: 'Espalda + bíceps', zoneKeys: ['back', 'biceps'], exercises: ['Dominadas', 'Remo en polea baja', 'Jalón al pecho', 'Curl martillo'] },
    { dayIndex: 4, title: 'Pierna', zoneKeys: ['legs', 'glutes'], exercises: ['Sentadilla', 'Prensa de piernas', 'Peso muerto rumano', 'Hip thrust'] },
    { dayIndex: 6, title: 'Hombro + core', zoneKeys: ['shoulders', 'abs'], exercises: ['Press militar', 'Elevaciones laterales', 'Face pull', 'Ab wheel'] },
  ],
  5: [
    { dayIndex: 1, title: 'Pecho', zoneKeys: ['chest'], exercises: ['Press banca plano', 'Press banca inclinado', 'Press banca con mancuernas', 'Aperturas en polea (crossover)'] },
    { dayIndex: 2, title: 'Espalda', zoneKeys: ['back'], exercises: ['Dominadas', 'Remo con barra', 'Jalón al pecho', 'Remo T'] },
    { dayIndex: 3, title: 'Pierna', zoneKeys: ['legs', 'glutes'], exercises: ['Sentadilla', 'Prensa de piernas', 'Curl femoral', 'Hip thrust'] },
    { dayIndex: 4, title: 'Hombro', zoneKeys: ['shoulders'], exercises: ['Press militar', 'Elevaciones laterales', 'Pájaros (deltoide posterior)', 'Face pull'] },
    { dayIndex: 5, title: 'Brazos + abdomen', zoneKeys: ['biceps', 'triceps', 'abs'], exercises: ['Curl de bíceps con barra', 'Curl martillo', 'Press francés', 'Plancha'] },
  ],
  6: [
    { dayIndex: 1, title: 'Push fuerza', zoneKeys: ['chest', 'shoulders', 'triceps'], exercises: ['Press banca plano', 'Press militar', 'Fondos en paralelas (pecho)'] },
    { dayIndex: 2, title: 'Pull fuerza', zoneKeys: ['back', 'biceps'], exercises: ['Dominadas', 'Remo con barra', 'Curl de bíceps con barra'] },
    { dayIndex: 3, title: 'Pierna fuerza', zoneKeys: ['legs', 'glutes'], exercises: ['Sentadilla', 'Peso muerto rumano', 'Prensa de piernas'] },
    { dayIndex: 4, title: 'Push volumen', zoneKeys: ['chest', 'shoulders', 'triceps'], exercises: ['Press inclinado con mancuernas', 'Elevaciones laterales', 'Extensión de tríceps con cuerda'] },
    { dayIndex: 5, title: 'Pull volumen', zoneKeys: ['back', 'biceps'], exercises: ['Jalón al pecho', 'Remo en máquina', 'Curl en banco inclinado'] },
    { dayIndex: 6, title: 'Pierna volumen', zoneKeys: ['legs', 'glutes', 'calves'], exercises: ['Hip thrust', 'Curl femoral', 'Elevación de gemelos sentado'] },
  ],
  7: [
    { dayIndex: 1, title: 'Pecho', zoneKeys: ['chest'], exercises: ['Press banca plano', 'Press banca inclinado', 'Aperturas con mancuernas'] },
    { dayIndex: 2, title: 'Espalda', zoneKeys: ['back'], exercises: ['Dominadas', 'Remo con barra', 'Jalón al pecho'] },
    { dayIndex: 3, title: 'Pierna', zoneKeys: ['legs'], exercises: ['Sentadilla', 'Prensa de piernas', 'Curl femoral'] },
    { dayIndex: 4, title: 'Hombro', zoneKeys: ['shoulders'], exercises: ['Press militar', 'Elevaciones laterales', 'Face pull'] },
    { dayIndex: 5, title: 'Brazos', zoneKeys: ['biceps', 'triceps'], exercises: ['Curl de bíceps con barra', 'Curl martillo', 'Press francés'] },
    { dayIndex: 6, title: 'Core + cardio', zoneKeys: ['abs', 'full_body'], exercises: ['Plancha', 'Ab wheel', 'Cinta de correr'] },
    { dayIndex: 7, title: 'Movilidad', zoneKeys: ['mobility', 'full_body'], exercises: ['Movilidad articular (calentamiento)', 'Bird dog', 'Dead bug'] },
  ],
};

const normalizePresetSession = (session) => ({
  dayIndex: Number(session.dayIndex),
  title: String(session.title || '').trim(),
  zoneKeys: Array.isArray(session.zoneKeys) ? session.zoneKeys.map((key) => String(key).trim()).filter(Boolean) : [],
  notes: String(session.notes || '').trim(),
  exercises: (Array.isArray(session.exercises) ? session.exercises : []).map((exercise) => (
    typeof exercise === 'string'
      ? { name: exercise, setsCount: 3 }
      : { catalogId: exercise.catalogId, name: String(exercise.name || '').trim(), setsCount: Number(exercise.setsCount || 3) || 3 }
  )).filter((exercise) => exercise.name),
});

export const getPlanPreset = (trainingDays = 3) => {
  const days = clampTrainingDays(trainingDays);
  return {
    trainingDays: days,
    sessions: (PRESETS[days] || PRESETS[3]).map(normalizePresetSession),
  };
};

const sanitizePlan = (payload = {}) => {
  const trainingDays = clampTrainingDays(payload.trainingDays);
  const sessions = (Array.isArray(payload.sessions) ? payload.sessions : [])
    .slice(0, 7)
    .map((session) => ({
      dayIndex: Math.min(7, Math.max(1, Number(session.dayIndex || 1))),
      title: String(session.title || '').trim().slice(0, 100),
      zoneKeys: (Array.isArray(session.zoneKeys) ? session.zoneKeys : []).map((key) => String(key).trim()).filter(Boolean).slice(0, 8),
      notes: String(session.notes || '').trim().slice(0, 300),
      exercises: (Array.isArray(session.exercises) ? session.exercises : []).slice(0, 20).map((exercise) => ({
        catalogId: exercise.catalogId,
        name: String(exercise.name || '').trim().slice(0, 120),
        setsCount: Math.min(20, Math.max(1, Number(exercise.setsCount || 3) || 3)),
      })).filter((exercise) => exercise.name),
    }))
    .filter((session) => session.title);
  return { trainingDays, sessions };
};

export const getUserSessionPlan = async (userId) => {
  assertMongoReady();
  const safeUserId = assertObjectId(userId);
  const { default: SessionPlan } = await import('../models/mongodb/SessionPlan.js');
  let plan = await SessionPlan.findOne({ userId: safeUserId }).lean();
  if (!plan) {
    plan = await SessionPlan.create({ userId: safeUserId, ...getPlanPreset(3) });
    return plan.toJSON();
  }
  return plan;
};

export const saveUserSessionPlan = async (userId, payload) => {
  assertMongoReady();
  const safeUserId = assertObjectId(userId);
  const plan = sanitizePlan(payload);
  const { default: SessionPlan } = await import('../models/mongodb/SessionPlan.js');
  return SessionPlan.findOneAndUpdate(
    { userId: safeUserId },
    { $set: plan },
    { new: true, upsert: true, runValidators: true }
  ).lean();
};
