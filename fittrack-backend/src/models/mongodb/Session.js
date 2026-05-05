import mongoose from 'mongoose';

const setSchema = new mongoose.Schema({
  reps: { type: Number, required: true },
  peso: { type: Number, required: true },
  rpe: { type: Number, min: 1, max: 10 }
});

const ejercicioRealizadoSchema = new mongoose.Schema({
  ejercicio_id: { type: Number, required: true },
  nombre_ejercicio: { type: String, required: true },
  sets: [setSchema]
});

const sessionSchema = new mongoose.Schema({
  usuario_id: { type: Number, required: true, index: true },
  fecha: { type: Date, default: Date.now },
  tipo_rutina: { type: String, required: true },
  ejercicios_realizados: [ejercicioRealizadoSchema],
  notas: { type: String },
  duracion_minutos: { type: Number }
}, {
  timestamps: true
});

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session;
