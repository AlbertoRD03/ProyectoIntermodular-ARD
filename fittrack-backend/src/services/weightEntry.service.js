import WeightEntry from '../models/mongodb/WeightEntry.js';

const buildUserMatch = (userId) => {
  const idStr = String(userId);
  const idNum = Number(idStr);
  return Number.isFinite(idNum)
    ? { $or: [{ usuario_id: idStr }, { usuario_id: idNum }] }
    : { usuario_id: idStr };
};

export const listWeightEntriesByUser = async (userId, { from, to, limit } = {}) => {
  const match = buildUserMatch(userId);
  const fechaFilter = {};
  if (from instanceof Date && !Number.isNaN(from.getTime())) fechaFilter.$gte = from;
  if (to instanceof Date && !Number.isNaN(to.getTime())) fechaFilter.$lt = to;
  const finalMatch = Object.keys(fechaFilter).length ? { ...match, fecha: fechaFilter } : match;
  const finalLimit = Math.min(500, Math.max(1, Number(limit) || 120));

  return WeightEntry.find(finalMatch)
    .sort({ fecha: -1 })
    .limit(finalLimit)
    .lean();
};

export const createWeightEntry = async (userId, payload) => {
  const fecha = payload?.fecha ? new Date(payload.fecha) : new Date();
  if (Number.isNaN(fecha.getTime())) throw new Error('Fecha inválida');
  const peso_kg = Number(payload?.peso_kg);
  if (!Number.isFinite(peso_kg) || peso_kg <= 0) throw new Error('Peso inválido');

  const doc = await WeightEntry.create({
    usuario_id: userId,
    fecha,
    peso_kg,
    nota: payload?.nota ? String(payload.nota).trim() : undefined,
  });
  return doc.toJSON();
};

export const deleteWeightEntry = async (entryId, userId) => {
  const match = buildUserMatch(userId);
  return WeightEntry.findOneAndDelete({ _id: entryId, ...match }).lean();
};

