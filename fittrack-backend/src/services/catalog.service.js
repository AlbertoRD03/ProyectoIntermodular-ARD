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
    // CHEST
    { nombre: 'Press banca plano', zoneKeys: ['chest'], typeKeys: ['strength'] },
    { nombre: 'Press banca inclinado', zoneKeys: ['chest'], typeKeys: ['strength'] },
    { nombre: 'Press banca declinado', zoneKeys: ['chest'], typeKeys: ['strength'] },
    { nombre: 'Press banca con mancuernas', zoneKeys: ['chest'], typeKeys: ['strength'] },
    { nombre: 'Press inclinado con mancuernas', zoneKeys: ['chest'], typeKeys: ['strength'] },
    { nombre: 'Press declinado con mancuernas', zoneKeys: ['chest'], typeKeys: ['strength'] },
    { nombre: 'Aperturas con mancuernas', zoneKeys: ['chest'], typeKeys: ['strength'] },
    { nombre: 'Aperturas en banco inclinado', zoneKeys: ['chest'], typeKeys: ['strength'] },
    { nombre: 'Aperturas en polea (crossover)', zoneKeys: ['chest'], typeKeys: ['strength'] },
    { nombre: 'Press en máquina (pecho)', zoneKeys: ['chest'], typeKeys: ['strength'] },
    { nombre: 'Fondos en paralelas (pecho)', zoneKeys: ['chest', 'triceps'], typeKeys: ['strength'] },
    { nombre: 'Flexiones', zoneKeys: ['chest', 'triceps', 'shoulders'], typeKeys: ['strength'] },
    { nombre: 'Flexiones inclinadas', zoneKeys: ['chest', 'triceps'], typeKeys: ['strength'] },
    { nombre: 'Flexiones declinadas', zoneKeys: ['chest', 'triceps', 'shoulders'], typeKeys: ['strength'] },
    { nombre: 'Pullover con mancuerna', zoneKeys: ['chest', 'back'], typeKeys: ['strength'] },

    // BACK
    { nombre: 'Dominadas', zoneKeys: ['back', 'biceps'], typeKeys: ['strength'] },
    { nombre: 'Dominadas asistidas', zoneKeys: ['back', 'biceps'], typeKeys: ['strength'] },
    { nombre: 'Jalón al pecho', zoneKeys: ['back', 'biceps'], typeKeys: ['strength'] },
    { nombre: 'Jalón tras nuca', zoneKeys: ['back'], typeKeys: ['strength'] },
    { nombre: 'Jalón con agarre neutro', zoneKeys: ['back', 'biceps'], typeKeys: ['strength'] },
    { nombre: 'Remo con barra', zoneKeys: ['back', 'lower_back'], typeKeys: ['strength'] },
    { nombre: 'Remo con mancuerna', zoneKeys: ['back'], typeKeys: ['strength'] },
    { nombre: 'Remo en máquina', zoneKeys: ['back'], typeKeys: ['strength'] },
    { nombre: 'Remo en polea baja', zoneKeys: ['back'], typeKeys: ['strength'] },
    { nombre: 'Remo T', zoneKeys: ['back'], typeKeys: ['strength'] },
    { nombre: 'Peso muerto rumano', zoneKeys: ['legs', 'lower_back'], typeKeys: ['strength'] },
    { nombre: 'Peso muerto convencional', zoneKeys: ['legs', 'lower_back', 'back'], typeKeys: ['strength'] },
    { nombre: 'Hiperextensiones lumbares', zoneKeys: ['lower_back', 'glutes'], typeKeys: ['strength'] },
    { nombre: 'Face pull', zoneKeys: ['back', 'shoulders'], typeKeys: ['strength'] },
    { nombre: 'Pull-over en polea', zoneKeys: ['back'], typeKeys: ['strength'] },

    // LEGS / GLUTES / CALVES
    { nombre: 'Sentadilla', zoneKeys: ['legs', 'glutes'], typeKeys: ['strength'] },
    { nombre: 'Sentadilla frontal', zoneKeys: ['legs', 'glutes'], typeKeys: ['strength'] },
    { nombre: 'Sentadilla búlgara', zoneKeys: ['legs', 'glutes'], typeKeys: ['strength'] },
    { nombre: 'Prensa de piernas', zoneKeys: ['legs', 'glutes'], typeKeys: ['strength'] },
    { nombre: 'Zancadas', zoneKeys: ['legs', 'glutes'], typeKeys: ['strength'] },
    { nombre: 'Zancadas caminando', zoneKeys: ['legs', 'glutes'], typeKeys: ['strength'] },
    { nombre: 'Step-up', zoneKeys: ['legs', 'glutes'], typeKeys: ['strength'] },
    { nombre: 'Extensión de cuádriceps', zoneKeys: ['legs'], typeKeys: ['strength'] },
    { nombre: 'Curl femoral', zoneKeys: ['legs'], typeKeys: ['strength'] },
    { nombre: 'Curl femoral sentado', zoneKeys: ['legs'], typeKeys: ['strength'] },
    { nombre: 'Peso muerto sumo', zoneKeys: ['legs', 'glutes', 'lower_back'], typeKeys: ['strength'] },
    { nombre: 'Hip thrust', zoneKeys: ['glutes', 'legs'], typeKeys: ['strength'] },
    { nombre: 'Puente de glúteos', zoneKeys: ['glutes'], typeKeys: ['strength'] },
    { nombre: 'Abducción de cadera en máquina', zoneKeys: ['glutes'], typeKeys: ['strength'] },
    { nombre: 'Aducción de cadera en máquina', zoneKeys: ['legs'], typeKeys: ['strength'] },
    { nombre: 'Elevación de gemelos de pie', zoneKeys: ['calves'], typeKeys: ['strength'] },
    { nombre: 'Elevación de gemelos sentado', zoneKeys: ['calves'], typeKeys: ['strength'] },

    // SHOULDERS / TRAPS
    { nombre: 'Press militar', zoneKeys: ['shoulders'], typeKeys: ['strength'] },
    { nombre: 'Press militar con mancuernas', zoneKeys: ['shoulders'], typeKeys: ['strength'] },
    { nombre: 'Press Arnold', zoneKeys: ['shoulders'], typeKeys: ['strength'] },
    { nombre: 'Elevaciones laterales', zoneKeys: ['shoulders'], typeKeys: ['strength'] },
    { nombre: 'Elevaciones laterales en polea', zoneKeys: ['shoulders'], typeKeys: ['strength'] },
    { nombre: 'Elevaciones frontales', zoneKeys: ['shoulders'], typeKeys: ['strength'] },
    { nombre: 'Pájaros (deltoide posterior)', zoneKeys: ['shoulders'], typeKeys: ['strength'] },
    { nombre: 'Pájaros en peck deck', zoneKeys: ['shoulders'], typeKeys: ['strength'] },
    { nombre: 'Encogimientos de trapecio con barra', zoneKeys: ['traps'], typeKeys: ['strength'] },
    { nombre: 'Encogimientos de trapecio con mancuernas', zoneKeys: ['traps'], typeKeys: ['strength'] },

    // BICEPS
    { nombre: 'Curl de bíceps con barra', zoneKeys: ['biceps'], typeKeys: ['strength'] },
    { nombre: 'Curl de bíceps con mancuernas', zoneKeys: ['biceps'], typeKeys: ['strength'] },
    { nombre: 'Curl martillo', zoneKeys: ['biceps', 'arms'], typeKeys: ['strength'] },
    { nombre: 'Curl concentrado', zoneKeys: ['biceps'], typeKeys: ['strength'] },
    { nombre: 'Curl en banco inclinado', zoneKeys: ['biceps'], typeKeys: ['strength'] },
    { nombre: 'Curl en polea', zoneKeys: ['biceps'], typeKeys: ['strength'] },
    { nombre: 'Curl predicador', zoneKeys: ['biceps'], typeKeys: ['strength'] },

    // TRICEPS
    { nombre: 'Extensión de tríceps en polea', zoneKeys: ['triceps'], typeKeys: ['strength'] },
    { nombre: 'Extensión de tríceps con cuerda', zoneKeys: ['triceps'], typeKeys: ['strength'] },
    { nombre: 'Press francés', zoneKeys: ['triceps'], typeKeys: ['strength'] },
    { nombre: 'Extensión de tríceps con mancuerna', zoneKeys: ['triceps'], typeKeys: ['strength'] },
    { nombre: 'Patada de tríceps', zoneKeys: ['triceps'], typeKeys: ['strength'] },
    { nombre: 'Fondos en banco', zoneKeys: ['triceps'], typeKeys: ['strength'] },

    // ABS / CORE / MOBILITY
    { nombre: 'Plancha', zoneKeys: ['abs'], typeKeys: ['strength', 'mobility'] },
    { nombre: 'Plancha lateral', zoneKeys: ['abs'], typeKeys: ['strength', 'mobility'] },
    { nombre: 'Crunch', zoneKeys: ['abs'], typeKeys: ['strength'] },
    { nombre: 'Crunch en polea', zoneKeys: ['abs'], typeKeys: ['strength'] },
    { nombre: 'Elevaciones de piernas', zoneKeys: ['abs'], typeKeys: ['strength'] },
    { nombre: 'Ab wheel', zoneKeys: ['abs'], typeKeys: ['strength'] },
    { nombre: 'Russian twists', zoneKeys: ['abs'], typeKeys: ['strength'] },
    { nombre: 'Bird dog', zoneKeys: ['abs', 'lower_back'], typeKeys: ['mobility'] },
    { nombre: 'Dead bug', zoneKeys: ['abs'], typeKeys: ['mobility'] },

    // CARDIO (gym)
    { nombre: 'Cinta de correr', zoneKeys: ['legs'], typeKeys: ['cardio'] },
    { nombre: 'Bicicleta estática', zoneKeys: ['legs'], typeKeys: ['cardio'] },
    { nombre: 'Elíptica', zoneKeys: ['legs'], typeKeys: ['cardio'] },
    { nombre: 'Remo ergómetro', zoneKeys: ['back', 'legs'], typeKeys: ['cardio'] },
    { nombre: 'Escaladora', zoneKeys: ['legs', 'glutes'], typeKeys: ['cardio'] },

    // HIIT / FULL BODY
    { nombre: 'Burpees', zoneKeys: ['full_body'], typeKeys: ['hiit'] },
    { nombre: 'Mountain climbers', zoneKeys: ['full_body', 'abs'], typeKeys: ['hiit'] },
    { nombre: 'Jumping jacks', zoneKeys: ['full_body'], typeKeys: ['hiit'] },
    { nombre: 'Kettlebell swing', zoneKeys: ['full_body', 'glutes'], typeKeys: ['hiit', 'strength'] },
    { nombre: 'Battle ropes', zoneKeys: ['full_body', 'arms'], typeKeys: ['hiit'] }
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
  if (z) {
    const keys = z
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    filter.zoneKeys = keys.length > 1 ? { $in: keys } : keys[0];
  }
  if (t) filter.typeKeys = t;

  return ExerciseCatalog.find(filter).sort({ nombre: 1 }).limit(50).lean();
};
