import mongoose from 'mongoose';

const weightEntrySchema = new mongoose.Schema(
  {
    usuario_id: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    fecha: { type: Date, required: true, index: true },
    peso_kg: { type: Number, required: true, min: 0 },
    nota: { type: String, trim: true },
  },
  { timestamps: true }
);

weightEntrySchema.index({ usuario_id: 1, fecha: -1 });

const WeightEntry =
  mongoose.models.WeightEntry || mongoose.model('WeightEntry', weightEntrySchema);

export default WeightEntry;

