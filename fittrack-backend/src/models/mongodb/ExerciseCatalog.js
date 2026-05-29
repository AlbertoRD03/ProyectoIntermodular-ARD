import mongoose from 'mongoose';

const exerciseCatalogSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    zoneKeys: { type: [String], default: [], index: true },
    typeKeys: { type: [String], default: [], index: true }
  },
  { timestamps: true }
);

exerciseCatalogSchema.index({ nombre: 1 });

const ExerciseCatalog =
  mongoose.models.ExerciseCatalog || mongoose.model('ExerciseCatalog', exerciseCatalogSchema);

export default ExerciseCatalog;
