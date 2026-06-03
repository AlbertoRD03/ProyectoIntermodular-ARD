import mongoose from 'mongoose';

const plannedExerciseSchema = new mongoose.Schema({
  catalogId: { type: mongoose.Schema.Types.Mixed },
  name: { type: String, required: true, trim: true },
  setsCount: { type: Number, default: 3, min: 1, max: 20 },
}, { _id: false });

const plannedSessionSchema = new mongoose.Schema({
  dayIndex: { type: Number, required: true, min: 1, max: 7 },
  title: { type: String, required: true, trim: true },
  zoneKeys: [{ type: String, trim: true }],
  notes: { type: String, default: '', trim: true },
  exercises: [plannedExerciseSchema],
}, { _id: false });

const sessionPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  trainingDays: { type: Number, required: true, min: 1, max: 7, default: 3 },
  sessions: [plannedSessionSchema],
}, {
  timestamps: true,
  toJSON: {
    transform(_doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

const SessionPlan = mongoose.models.SessionPlan || mongoose.model('SessionPlan', sessionPlanSchema);

export default SessionPlan;
