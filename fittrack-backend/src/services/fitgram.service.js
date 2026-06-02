import mongoose from 'mongoose';
import { createHttpError } from '../utils/httpError.js';
import { createMongoUnavailableError, isMongoConfigured, isMongoConnected } from '../utils/mongodb.js';

const assertMongoReady = () => {
  if (!isMongoConfigured() || !isMongoConnected()) throw createMongoUnavailableError();
};

const assertObjectId = (value, message = 'ID inválido') => {
  const str = String(value || '').trim();
  if (!mongoose.Types.ObjectId.isValid(str)) throw createHttpError(400, message);
  return str;
};

const normalizeTags = (value) => {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : String(value).split(',');
  const tags = raw
    .map((t) => String(t || '').trim())
    .filter(Boolean)
    .slice(0, 12)
    .map((t) => t.replace(/\s+/g, '_').toUpperCase());
  return Array.from(new Set(tags));
};

const toPublicUser = (userDoc) => {
  if (!userDoc) return null;
  return {
    id: String(userDoc._id ?? userDoc.id),
    nombre: userDoc.nombre || '',
    apodo: userDoc.apodo || '',
    photo_url: userDoc.photo_url || '',
  };
};

const attachAuthors = async (posts) => {
  const { default: User } = await import('../models/mongodb/User.js');
  const ids = Array.from(new Set(posts.map((p) => String(p.authorId)).filter(Boolean)));
  if (!ids.length) return posts.map((p) => ({ ...p, author: null }));

  const users = await User.find({ _id: { $in: ids } }).select('_id nombre apodo photo_url').lean();
  const map = new Map(users.map((u) => [String(u._id), toPublicUser(u)]));
  return posts.map((p) => ({ ...p, author: map.get(String(p.authorId)) || null }));
};

export const createPost = async ({ authorId, image_url, caption, tags }) => {
  assertMongoReady();
  const authorObjectId = assertObjectId(authorId, 'Autor inválido');

  const url = String(image_url || '').trim();
  if (!url) throw createHttpError(400, 'La imagen es obligatoria');
  if (url.length > 2048) throw createHttpError(400, 'La URL de imagen es demasiado larga');

  const safeCaption = String(caption || '').trim().slice(0, 500);
  const safeTags = normalizeTags(tags);

  const { default: FitGramPost } = await import('../models/mongodb/FitGramPost.js');
  const post = await FitGramPost.create({
    authorId: authorObjectId,
    image_url: url,
    caption: safeCaption,
    tags: safeTags,
    visibility: 'public',
  });

  return post.toJSON();
};

export const listUserPosts = async ({ userId, limit = 60 } = {}) => {
  assertMongoReady();
  const authorId = assertObjectId(userId, 'Usuario inválido');
  const safeLimit = Math.min(120, Math.max(1, Number(limit) || 60));

  const { default: FitGramPost } = await import('../models/mongodb/FitGramPost.js');
  const posts = await FitGramPost.find({ authorId })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  const normalized = posts.map((p) => ({
    id: String(p._id),
    authorId: String(p.authorId),
    image_url: p.image_url,
    caption: p.caption || '',
    tags: p.tags || [],
    visibility: p.visibility,
    createdAt: p.createdAt,
  }));
  return attachAuthors(normalized);
};

export const listExplore = async ({ limit = 60 } = {}) => {
  assertMongoReady();
  const safeLimit = Math.min(120, Math.max(1, Number(limit) || 60));
  const { default: FitGramPost } = await import('../models/mongodb/FitGramPost.js');
  const posts = await FitGramPost.find({ visibility: 'public' })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();
  const normalized = posts.map((p) => ({
    id: String(p._id),
    authorId: String(p.authorId),
    image_url: p.image_url,
    caption: p.caption || '',
    tags: p.tags || [],
    visibility: p.visibility,
    createdAt: p.createdAt,
  }));
  return attachAuthors(normalized);
};

export const listFeed = async ({ viewerUserId, limit = 60 } = {}) => {
  assertMongoReady();
  const viewerId = assertObjectId(viewerUserId, 'Usuario inválido');
  const safeLimit = Math.min(120, Math.max(1, Number(limit) || 60));

  const { default: Follow } = await import('../models/mongodb/Follow.js');
  const { default: FitGramPost } = await import('../models/mongodb/FitGramPost.js');

  const follows = await Follow.find({ followerId: viewerId }).select('followingId').lean();
  const followingIds = follows.map((f) => f.followingId);

  // Feed = posts from following + self.
  const authorIds = [new mongoose.Types.ObjectId(viewerId), ...followingIds];
  const posts = await FitGramPost.find({ authorId: { $in: authorIds }, visibility: 'public' })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  const normalized = posts.map((p) => ({
    id: String(p._id),
    authorId: String(p.authorId),
    image_url: p.image_url,
    caption: p.caption || '',
    tags: p.tags || [],
    visibility: p.visibility,
    createdAt: p.createdAt,
  }));
  return attachAuthors(normalized);
};
