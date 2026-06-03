import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 400, default: '' },
    type: {
      type: String,
      enum: ['volume', 'sessions', 'duration', 'exercise_max'],
      required: true,
      index: true,
    },
    targetValue: { type: Number, required: true, min: 1 },
    unit: { type: String, trim: true, maxlength: 20, default: '' },
    exerciseName: { type: String, trim: true, maxlength: 120, default: '' },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending',
      index: true,
    },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

challengeSchema.index({ creatorId: 1, targetId: 1, createdAt: -1 });
challengeSchema.index({ targetId: 1, status: 1, createdAt: -1 });

challengeSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Challenge = mongoose.models.Challenge || mongoose.model('Challenge', challengeSchema);

export default Challenge;
