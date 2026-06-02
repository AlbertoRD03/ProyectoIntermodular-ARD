import mongoose from 'mongoose';

const fitGramPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    image_url: { type: String, required: true, trim: true },
    caption: { type: String, trim: true, default: '' },
    tags: { type: [String], default: [] },
    visibility: { type: String, enum: ['public'], default: 'public' },
  },
  { timestamps: true }
);

fitGramPostSchema.index({ createdAt: -1 });

fitGramPostSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const FitGramPost = mongoose.models.FitGramPost || mongoose.model('FitGramPost', fitGramPostSchema);

export default FitGramPost;

