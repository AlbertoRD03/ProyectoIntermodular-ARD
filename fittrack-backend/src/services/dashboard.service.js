import Session from '../models/mongodb/Session.js';

const roundToTwo = (value) => Number(value.toFixed(2));

const calculateSessionIntensity = (session) => {
  if (!session?.ejercicios_realizados?.length) {
    return { totalVolume: 0, totalReps: 0, intensity: 0 };
  }

  let totalVolume = 0;
  let totalReps = 0;

  for (const ejercicio of session.ejercicios_realizados) {
    if (!ejercicio?.sets?.length) continue;
    for (const set of ejercicio.sets) {
      const reps = Number(set.reps || 0);
      const peso = Number(set.peso || 0);
      totalReps += reps;
      totalVolume += reps * peso;
    }
  }

  const intensity = totalReps > 0 ? totalVolume / totalReps : 0;

  return { totalVolume, totalReps, intensity };
};

export const getWeeklyWorkload = async (userId) => {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 6);
  fromDate.setHours(0, 0, 0, 0);

  const workload = await Session.aggregate([
    { $match: { usuario_id: userId, fecha: { $gte: fromDate } } },
    { $unwind: '$ejercicios_realizados' },
    { $unwind: '$ejercicios_realizados.sets' },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$fecha' }
        },
        volumen_total: {
          $sum: {
            $multiply: [
              { $toDouble: '$ejercicios_realizados.sets.peso' },
              { $toDouble: '$ejercicios_realizados.sets.reps' }
            ]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return workload.map((item) => ({
    fecha: item._id,
    volumen_total: roundToTwo(item.volumen_total || 0)
  }));
};

export const getMuscleDistribution = async (userId) => {
  const distribution = await Session.aggregate([
    { $match: { usuario_id: userId } },
    { $unwind: '$ejercicios_realizados' },
    {
      $group: {
        _id: '$ejercicios_realizados.nombre_ejercicio',
        total: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);

  return distribution.map((item) => ({
    ejercicio: item._id,
    total: item.total
  }));
};

export const getLifetimeStats = async (userId) => {
  const [firstSession, lastSession] = await Promise.all([
    Session.findOne({ usuario_id: userId }).sort({ fecha: 1 }).lean(),
    Session.findOne({ usuario_id: userId }).sort({ fecha: -1 }).lean()
  ]);

  if (!firstSession || !lastSession) {
    return {
      firstSessionDate: null,
      lastSessionDate: null,
      firstIntensity: 0,
      lastIntensity: 0,
      improvementPercent: 0,
      totalVolume: 0
    };
  }

  const firstStats = calculateSessionIntensity(firstSession);
  const lastStats = calculateSessionIntensity(lastSession);

  const improvementPercent = firstStats.intensity > 0
    ? ((lastStats.intensity - firstStats.intensity) / firstStats.intensity) * 100
    : 0;

  const totalVolumeAgg = await Session.aggregate([
    { $match: { usuario_id: userId } },
    { $unwind: '$ejercicios_realizados' },
    { $unwind: '$ejercicios_realizados.sets' },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $multiply: [
              { $toDouble: '$ejercicios_realizados.sets.peso' },
              { $toDouble: '$ejercicios_realizados.sets.reps' }
            ]
          }
        }
      }
    }
  ]);

  const totalVolume = totalVolumeAgg[0]?.total || 0;

  return {
    firstSessionDate: firstSession.fecha,
    lastSessionDate: lastSession.fecha,
    firstIntensity: roundToTwo(firstStats.intensity),
    lastIntensity: roundToTwo(lastStats.intensity),
    improvementPercent: roundToTwo(improvementPercent),
    totalVolume: roundToTwo(totalVolume)
  };
};
