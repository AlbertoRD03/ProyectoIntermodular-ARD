import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    provider: { type: String, required: true, enum: ['mysql', 'mongodb'] },
    userId: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// TTL index: Mongo will delete docs automatically after expiresAt.
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetToken =
  mongoose.models.PasswordResetToken ||
  mongoose.model('PasswordResetToken', passwordResetTokenSchema);

export default PasswordResetToken;
