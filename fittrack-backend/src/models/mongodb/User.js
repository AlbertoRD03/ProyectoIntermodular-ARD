import mongoose from 'mongoose';

const physicalProfileSchema = new mongoose.Schema(
  {
    edad: { type: Number, min: 0 },
    genero: { type: String, trim: true },
    altura_cm: { type: Number, min: 0 },
    peso_kg: { type: Number, min: 0 },
    nivel_actividad: { type: String, trim: true },
    objetivo_principal: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },

    nombre: { type: String, required: true, trim: true },
    apodo: { type: String, trim: true, default: '' },
    telefono: { type: String, trim: true, default: '' },

    physicalProfile: { type: physicalProfileSchema, default: undefined },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;

