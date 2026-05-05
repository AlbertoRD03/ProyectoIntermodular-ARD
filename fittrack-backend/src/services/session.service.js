import Session from '../models/mongodb/Session.js';

export const createSession = async (data) => {
  return Session.create(data);
};

export const getSessionsByUser = async (userId) => {
  return Session.find({ usuario_id: userId }).sort({ fecha: -1 });
};

export const updateSession = async (sessionId, userId, data) => {
  return Session.findOneAndUpdate(
    { _id: sessionId, usuario_id: userId },
    data,
    { new: true }
  );
};

export const deleteSession = async (sessionId, userId) => {
  return Session.findOneAndDelete({ _id: sessionId, usuario_id: userId });
};

export const getExerciseHistory = async (userId, exerciseId) => {
  return Session.aggregate([
    {
      $match: {
        usuario_id: userId,
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
