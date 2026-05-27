import mongoose from 'mongoose';

const workoutTypeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    label_es: { type: String, required: true, trim: true },
    label_en: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const WorkoutType = mongoose.models.WorkoutType || mongoose.model('WorkoutType', workoutTypeSchema);

export default WorkoutType;

