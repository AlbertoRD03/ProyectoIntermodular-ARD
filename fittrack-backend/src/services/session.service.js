import Session from '../models/mongodb/Session.js';

export const createSession = async (data) => {
  return Session.create(data);
};

export const getSessionsByUser = async (userId) => {
  const idStr = String(userId);
  const idNum = Number(idStr);
  const match = Number.isFinite(idNum)
    ? { $or: [{ usuario_id: idStr }, { usuario_id: idNum }] }
    : { usuario_id: idStr };
  return Session.find(match).sort({ fecha: -1 });
};

export const updateSession = async (sessionId, userId, data) => {
  const idStr = String(userId);
  const idNum = Number(idStr);
  const userMatch = Number.isFinite(idNum)
    ? { $or: [{ usuario_id: idStr }, { usuario_id: idNum }] }
    : { usuario_id: idStr };

  return Session.findOneAndUpdate(
    { _id: sessionId, ...userMatch },
    data,
    { new: true }
  );
};

export const deleteSession = async (sessionId, userId) => {
  const idStr = String(userId);
  const idNum = Number(idStr);
  const userMatch = Number.isFinite(idNum)
    ? { $or: [{ usuario_id: idStr }, { usuario_id: idNum }] }
    : { usuario_id: idStr };
  return Session.findOneAndDelete({ _id: sessionId, ...userMatch });
};

export const getExerciseHistory = async (userId, exerciseId) => {
  const idStr = String(userId);
  const idNum = Number(idStr);
  const userMatch = Number.isFinite(idNum)
    ? { $or: [{ usuario_id: idStr }, { usuario_id: idNum }] }
    : { usuario_id: idStr };

  return Session.aggregate([
    {
      $match: {
        ...userMatch,
        'ejercicios_realizados.ejercicio_id': exerciseId
      }
    },
    { $unwind: '$ejercicios_realizados' },
    { $match: { 'ejercicios_realizados.ejercicio_id': exerciseId } },
    {
      $project: {
        fecha: 1,
        tipo_rutina: 1,
        ejercicio: '$ejercicios_realizados'
      }
    },
    { $sort: { fecha: -1 } }
  ]);
};
