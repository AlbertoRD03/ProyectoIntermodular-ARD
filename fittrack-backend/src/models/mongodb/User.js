import mongoose from 'mongoose';

const physicalProfileSchema = new mongoose.Schema(
  {
    edad: { type: Number, min: 0 },
    genero: { type: String, trim: true },
    altura_cm: { type: Number, min: 0 },
    peso_kg: { type: Number, min: 0 },
    nivel_actividad: { type: String, trim: true },
    objetivo_principal: { type: String, trim: true },
    // Optional extended fields (editable from the physical profile screen)
    peso_objetivo_kg: { type: Number, min: 0 },
    fecha_objetivo: { type: Date },
    meta_semanal: { type: String, trim: true },
    actividad_preferida: { type: String, trim: true },
    grasa_pct: { type: Number, min: 0 },
    masa_muscular_kg: { type: Number, min: 0 },
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
