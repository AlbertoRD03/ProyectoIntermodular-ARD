import mongoose from 'mongoose';
import { createHttpError } from '../utils/httpError.js';
import { createMongoUnavailableError, isMongoConfigured, isMongoConnected } from '../utils/mongodb.js';
import { createNotification } from './notification.service.js';

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

const normalizePostType = (value) => {
  const type = String(value || '').trim();
  return ['photo', 'workout', 'info'].includes(type) ? type : 'photo';
};

const normalizeWorkoutSnapshot = (value) => {
  if (!value || typeof value !== 'object') return undefined;
  const title = String(value.title || '').trim().slice(0, 120);
  const workoutId = String(value.workoutId || value.id || '').trim().slice(0, 80);
  const dateLabel = String(value.dateLabel || '').trim().slice(0, 80);
  const stats = value.stats && typeof value.stats === 'object' ? value.stats : {};
  const exercises = Array.isArray(value.exercises)
    ? value.exercises.slice(0, 30).map((exercise) => ({
        name: String(exercise.name || exercise.nombre || '').trim().slice(0, 120),
        sets: Number(exercise.sets || 0) || 0,
        setDetails: Array.isArray(exercise.setDetails)
          ? exercise.setDetails.slice(0, 20).map((set) => ({
              reps: Number(set.reps || 0) || 0,
              peso: Number(set.peso || set.weight || 0) || 0,
              rpe: Number(set.rpe || 0) || undefined,
            })).filter((set) => set.reps > 0 && set.peso >= 0)
          : [],
        volumeKg: Number(exercise.volumeKg || 0) || 0,
      })).filter((exercise) => exercise.name)
    : [];

  if (!title && !workoutId && !exercises.length) return undefined;

  return {
    workoutId,
    title: title || 'Entreno',
    dateLabel,
    stats: {
      exercises: Number(stats.exercises || exercises.length || 0) || 0,
      duration: String(stats.duration || '').trim().slice(0, 40),
      calories: String(stats.calories || '').trim().slice(0, 40),
      volumeKg: Number(stats.volumeKg || 0) || 0,
    },
    exercises,
  };
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
  const commentAuthorIds = posts.flatMap((p) => (p.comments || []).map((c) => String(c.authorId)).filter(Boolean));
  const ids = Array.from(new Set([...posts.map((p) => String(p.authorId)).filter(Boolean), ...commentAuthorIds]));
  if (!ids.length) return posts.map((p) => ({ ...p, author: null }));

  const users = await User.find({ _id: { $in: ids } }).select('_id nombre apodo photo_url').lean();
  const map = new Map(users.map((u) => [String(u._id), toPublicUser(u)]));
  return posts.map((p) => ({
    ...p,
    author: map.get(String(p.authorId)) || null,
    comments: (p.comments || []).map((c) => ({
      ...c,
      author: map.get(String(c.authorId)) || null,
    })),
  }));
};

const normalizePost = (p) => ({
  id: String(p._id),
  authorId: String(p.authorId),
  type: p.type || 'photo',
  image_url: p.image_url,
  caption: p.caption || '',
  tags: p.tags || [],
  workoutSnapshot: p.workoutSnapshot,
  comments: (p.comments || []).map((c) => ({
    id: String(c._id),
    authorId: String(c.authorId),
    text: c.text || '',
    createdAt: c.createdAt,
  })),
  commentsCount: Array.isArray(p.comments) ? p.comments.length : 0,
  visibility: p.visibility,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

export const createPost = async ({ authorId, image_url, caption, tags, type, workoutSnapshot }) => {
  assertMongoReady();
  const authorObjectId = assertObjectId(authorId, 'Autor inválido');

  const url = String(image_url || '').trim();
  if (!url) throw createHttpError(400, 'La imagen es obligatoria');
  if (url.length > 2048) throw createHttpError(400, 'La URL de imagen es demasiado larga');

  const safeCaption = String(caption || '').trim().slice(0, 500);
  const safeTags = normalizeTags(tags);
  const safeType = normalizePostType(type);
  const safeWorkoutSnapshot = safeType === 'workout' ? normalizeWorkoutSnapshot(workoutSnapshot) : undefined;

  const { default: FitGramPost } = await import('../models/mongodb/FitGramPost.js');
  const post = await FitGramPost.create({
    authorId: authorObjectId,
    type: safeType,
    image_url: url,
    caption: safeCaption,
    tags: safeTags,
    workoutSnapshot: safeWorkoutSnapshot,
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

  const normalized = posts.map(normalizePost);
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
  const normalized = posts.map(normalizePost);
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

  // Community feed = posts from followed users only.
  const authorIds = followingIds;
  const posts = await FitGramPost.find({ authorId: { $in: authorIds }, visibility: 'public' })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  const normalized = posts.map(normalizePost);
  return attachAuthors(normalized);
};

export const updatePost = async ({ viewerUserId, postId, caption, tags }) => {
  assertMongoReady();
  const viewerId = assertObjectId(viewerUserId, 'Usuario inválido');
  const id = assertObjectId(postId, 'Publicación inválida');

  const { default: FitGramPost } = await import('../models/mongodb/FitGramPost.js');
  const post = await FitGramPost.findOneAndUpdate(
    { _id: id, authorId: viewerId },
    {
      $set: {
        caption: String(caption || '').trim().slice(0, 500),
        tags: normalizeTags(tags),
      },
    },
    { new: true }
  ).lean();

  if (!post) throw createHttpError(404, 'Publicación no encontrada');
  const [withAuthor] = await attachAuthors([normalizePost(post)]);
  return withAuthor;
};

export const deletePost = async ({ viewerUserId, postId }) => {
  assertMongoReady();
  const viewerId = assertObjectId(viewerUserId, 'Usuario inválido');
  const id = assertObjectId(postId, 'Publicación inválida');

  const { default: FitGramPost } = await import('../models/mongodb/FitGramPost.js');
  const post = await FitGramPost.findOneAndDelete({ _id: id, authorId: viewerId }).lean();
  if (!post) throw createHttpError(404, 'Publicación no encontrada');
  return { deletedPost: String(post._id) };
};

export const addComment = async ({ viewerUserId, postId, text }) => {
  assertMongoReady();
  const viewerId = assertObjectId(viewerUserId, 'Usuario inválido');
  const id = assertObjectId(postId, 'Publicación inválida');
  const safeText = String(text || '').trim().slice(0, 300);
  if (!safeText) throw createHttpError(400, 'El comentario no puede estar vacío');

  const { default: FitGramPost } = await import('../models/mongodb/FitGramPost.js');
  const post = await FitGramPost.findOneAndUpdate(
    { _id: id, visibility: 'public' },
    { $push: { comments: { authorId: viewerId, text: safeText } } },
    { new: true }
  ).lean();

  if (!post) throw createHttpError(404, 'Publicación no encontrada');
  const { default: User } = await import('../models/mongodb/User.js');
  const actor = await User.findById(viewerId).select('_id nombre apodo').lean();
  const actorName = actor?.apodo || actor?.nombre || 'Un usuario';
  await createNotification({
    userId: String(post.authorId),
    actorId: viewerId,
    type: 'post_comment',
    title: 'Nuevo comentario',
    message: `@${actorName} comentó tu publicación: "${safeText.slice(0, 80)}"`,
    link: '/fitgram?tab=profile',
    metadata: { postId: id },
    dedupeKey: `comment:${String(post.comments?.[post.comments.length - 1]?._id || Date.now())}`,
  });
  const [withAuthor] = await attachAuthors([normalizePost(post)]);
  return withAuthor;
};

export const copyWorkoutFromPost = async ({ viewerUserId, postId }) => {
  assertMongoReady();
  const viewerId = assertObjectId(viewerUserId, 'Usuario inválido');
  const id = assertObjectId(postId, 'Publicación inválida');

  const { default: FitGramPost } = await import('../models/mongodb/FitGramPost.js');
  const { default: Session } = await import('../models/mongodb/Session.js');
  const { default: User } = await import('../models/mongodb/User.js');
  const post = await FitGramPost.findOne({ _id: id, type: 'workout', visibility: 'public' }).lean();
  if (!post?.workoutSnapshot) throw createHttpError(404, 'Entreno no encontrado');
  const [sourceUser, viewerUser] = await Promise.all([
    User.findById(post.authorId).select('_id nombre apodo').lean(),
    User.findById(viewerId).select('_id nombre apodo').lean(),
  ]);
  const sourceUsername = sourceUser?.apodo || sourceUser?.nombre || 'usuario';
  const viewerUsername = viewerUser?.apodo || viewerUser?.nombre || 'Un usuario';

  const snapshot = normalizeWorkoutSnapshot(post.workoutSnapshot);
  if (!snapshot?.exercises?.length) throw createHttpError(400, 'La publicación no tiene ejercicios copiables');

  const exercises = snapshot.exercises.map((exercise, index) => {
    const setDetails = Array.isArray(exercise.setDetails) ? exercise.setDetails : [];
    const fallbackWeight = exercise.volumeKg > 0 ? exercise.volumeKg : 0;
    const sets = setDetails.length
      ? setDetails.map((set) => ({
          reps: Number(set.reps || 0) || 1,
          peso: Number(set.peso || 0) || 0,
          ...(set.rpe ? { rpe: Number(set.rpe) } : {}),
        }))
      : [{ reps: 1, peso: fallbackWeight }];

    return {
      ejercicio_id: `fitgram-${String(post._id)}-${index}`,
      nombre_ejercicio: exercise.name,
      sets,
    };
  });

  const durationMatch = String(snapshot.stats?.duration || '').match(/\d+/);
  const session = await Session.create({
    usuario_id: viewerId,
    fecha: new Date(),
    tipo_rutina: snapshot.title || 'Entreno copiado de FitGram',
    ejercicios_realizados: exercises,
    notas: post.caption
      ? `Copiada desde FitGram de @${sourceUsername}: ${String(post.caption).slice(0, 220)}`
      : `Copiada desde FitGram de @${sourceUsername}`,
    duracion_minutos: durationMatch ? Number(durationMatch[0]) : undefined,
    copiedFrom: {
      postId: post._id,
      userId: post.authorId,
      username: sourceUsername,
    },
  });

  await createNotification({
    userId: String(post.authorId),
    actorId: viewerId,
    type: 'workout_copied',
    title: 'Entreno guardado',
    message: `@${viewerUsername} ha guardado tu entreno "${snapshot.title || 'Entreno'}".`,
    link: '/fitgram?tab=profile',
    metadata: { postId: id, sessionId: String(session._id) },
    dedupeKey: `workout-copied:${String(session._id)}`,
  });

  return session.toJSON();
};
