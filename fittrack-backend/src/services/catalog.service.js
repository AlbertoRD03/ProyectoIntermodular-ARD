import BodyZone from '../models/mongodb/BodyZone.js';
import WorkoutType from '../models/mongodb/WorkoutType.js';
import ExerciseCatalog from '../models/mongodb/ExerciseCatalog.js';

let seeded = false;

const seedIfEmpty = async () => {
  if (seeded) return;

  const defaultZones = [
    { key: 'full_body', label_es: 'Cuerpo completo', label_en: 'Full body' },
    { key: 'chest', label_es: 'Pecho', label_en: 'Chest' },
    { key: 'back', label_es: 'Espalda', label_en: 'Back' },
    { key: 'legs', label_es: 'Piernas', label_en: 'Legs' },
    { key: 'shoulders', label_es: 'Hombros', label_en: 'Shoulders' },
    { key: 'arms', label_es: 'Brazos', label_en: 'Arms' },
    { key: 'biceps', label_es: 'Bíceps', label_en: 'Biceps' },
    { key: 'triceps', label_es: 'Tríceps', label_en: 'Triceps' },
    { key: 'abs', label_es: 'Abdomen', label_en: 'Abs' },
    { key: 'glutes', label_es: 'Glúteos', label_en: 'Glutes' },
    { key: 'calves', label_es: 'Gemelos', label_en: 'Calves' },
    { key: 'lower_back', label_es: 'Lumbar', label_en: 'Lower back' },
    { key: 'traps', label_es: 'Trapecio', label_en: 'Traps' }
  ];

  const defaultTypes = [
    { key: 'strength', label_es: 'Fuerza', label_en: 'Strength' },
    { key: 'cardio', label_es: 'Cardio', label_en: 'Cardio' },
    { key: 'hiit', label_es: 'HIIT', label_en: 'HIIT' },
    { key: 'mobility', label_es: 'Movilidad', label_en: 'Mobility' }
  ];

  const defaultExercises = [
    { nombre: 'Press banca plano', zoneKeys: ['chest'], typeKeys: ['strength'] },
    { nombre: 'Press banca inclinado', zoneKeys: ['chest'], typeKeys: ['strength'] },
    { nombre: 'Aperturas con mancuernas', zoneKeys: ['chest'], typeKeys: ['strength'] },
    { nombre: 'Dominadas', zoneKeys: ['back'], typeKeys: ['strength'] },
    { nombre: 'Remo con barra', zoneKeys: ['back'], typeKeys: ['strength'] },
    { nombre: 'Sentadilla', zoneKeys: ['legs'], typeKeys: ['strength'] },
    { nombre: 'Peso muerto', zoneKeys: ['legs', 'lower_back'], typeKeys: ['strength'] },
    { nombre: 'Press militar', zoneKeys: ['shoulders'], typeKeys: ['strength'] },
    { nombre: 'Elevaciones laterales', zoneKeys: ['shoulders'], typeKeys: ['strength'] },
    { nombre: 'Plancha', zoneKeys: ['abs'], typeKeys: ['strength', 'mobility'] }
  ];

  // Upsert defaults (works even if partial data already exists).
  await BodyZone.bulkWrite(
    defaultZones.map((z) => ({
      updateOne: {
        filter: { key: z.key },
        update: { $setOnInsert: z },
        upsert: true
      }
    }))
  );

  await WorkoutType.bulkWrite(
    defaultTypes.map((t) => ({
      updateOne: {
        filter: { key: t.key },
        update: { $setOnInsert: t },
        upsert: true
      }
    }))
  );

  await ExerciseCatalog.bulkWrite(
    defaultExercises.map((ex) => ({
      updateOne: {
        filter: { nombre: ex.nombre },
        update: { $setOnInsert: ex },
        upsert: true
      }
    }))
  );

  seeded = true;
};

export const listZones = async () => {
  await seedIfEmpty();
  return BodyZone.find({}).sort({ label_es: 1 }).lean();
};

export const listWorkoutTypes = async () => {
  await seedIfEmpty();
  return WorkoutType.find({}).sort({ label_es: 1 }).lean();
};

export const searchExercises = async ({ search = '', zoneKey = '', typeKey = '' } = {}) => {
  await seedIfEmpty();
  const q = String(search || '').trim();
  const z = String(zoneKey || '').trim().toLowerCase();
  const t = String(typeKey || '').trim().toLowerCase();

  const filter = {};
  if (q) filter.nombre = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (z) filter.zoneKeys = z;
  if (t) filter.typeKeys = t;

  return ExerciseCatalog.find(filter).sort({ nombre: 1 }).limit(50).lean();
};
