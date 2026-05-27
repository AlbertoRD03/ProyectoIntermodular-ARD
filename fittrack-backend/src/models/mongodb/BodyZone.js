import mongoose from 'mongoose';

const bodyZoneSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    label_es: { type: String, required: true, trim: true },
    label_en: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const BodyZone = mongoose.models.BodyZone || mongoose.model('BodyZone', bodyZoneSchema);

export default BodyZone;

