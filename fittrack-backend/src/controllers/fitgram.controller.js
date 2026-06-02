import {
  addComment,
  createPost,
  deletePost,
  listExplore,
  listFeed,
  listUserPosts,
  updatePost
} from '../services/fitgram.service.js';
import { getErrorStatus, shouldExposeErrorMessage } from '../utils/httpError.js';
import { isMySQLEnabled } from '../utils/mysqlEnabled.js';

const fail = (res, error, fallbackMessage) => {
  const status = getErrorStatus(error, 500);
  const message = shouldExposeErrorMessage(error) ? error.message : fallbackMessage;
  return res.status(status).json({ message });
};

export const createPostController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });
    const authorId = req.user?.id;
    const { image_url, caption, tags } = req.body || {};
    const post = await createPost({ authorId, image_url, caption, tags });
    return res.status(201).json({ post });
  } catch (error) {
    return fail(res, error, 'Error al crear la publicación');
  }
};

export const listFeedController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });
    const viewerUserId = req.user?.id;
    const limit = req.query?.limit;
    const posts = await listFeed({ viewerUserId, limit });
    return res.status(200).json({ posts });
  } catch (error) {
    return fail(res, error, 'Error al cargar el feed');
  }
};

export const listExploreController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });
    const limit = req.query?.limit;
    const posts = await listExplore({ limit });
    return res.status(200).json({ posts });
  } catch (error) {
    return fail(res, error, 'Error al cargar publicaciones');
  }
};

export const listUserPostsController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });
    const userId = req.params?.id;
    const limit = req.query?.limit;
    const posts = await listUserPosts({ userId, limit });
    return res.status(200).json({ posts });
  } catch (error) {
    return fail(res, error, 'Error al cargar publicaciones del usuario');
  }
};

export const updatePostController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });
    const viewerUserId = req.user?.id;
    const postId = req.params?.id;
    const { caption, tags } = req.body || {};
    const post = await updatePost({ viewerUserId, postId, caption, tags });
    return res.status(200).json({ post });
  } catch (error) {
    return fail(res, error, 'Error al actualizar la publicación');
  }
};

export const deletePostController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });
    const viewerUserId = req.user?.id;
    const postId = req.params?.id;
    const result = await deletePost({ viewerUserId, postId });
    return res.status(200).json(result);
  } catch (error) {
    return fail(res, error, 'Error al eliminar la publicación');
  }
};

export const addCommentController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });
    const viewerUserId = req.user?.id;
    const postId = req.params?.id;
    const { text } = req.body || {};
    const post = await addComment({ viewerUserId, postId, text });
    return res.status(201).json({ post });
  } catch (error) {
    return fail(res, error, 'Error al crear el comentario');
  }
};
