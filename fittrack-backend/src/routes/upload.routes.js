import express from 'express';
import crypto from 'node:crypto';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

const getCloudinaryConfig = () => {
  const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = String(process.env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = String(process.env.CLOUDINARY_API_SECRET || '').trim();
  const folder = String(process.env.CLOUDINARY_FOLDER || 'fittrack').trim();
  return { cloudName, apiKey, apiSecret, folder };
};

const sha1Hex = (input) => crypto.createHash('sha1').update(String(input)).digest('hex');

const signCloudinaryParams = (params, apiSecret) => {
  const keys = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && String(params[k]) !== '')
    .sort();
  const toSign = keys.map((k) => `${k}=${params[k]}`).join('&') + apiSecret;
  return sha1Hex(toSign);
};

router.get('/cloudinary-signature', verifyToken, (req, res) => {
  const { cloudName, apiKey, apiSecret, folder } = getCloudinaryConfig();
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(503).json({ error: 'Servicio de uploads no configurado' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = req.query?.public_id ? String(req.query.public_id) : '';
  const folderFromQuery = req.query?.folder ? String(req.query.folder) : '';
  const effectiveFolder = folderFromQuery.trim() ? folderFromQuery.trim() : folder;

  const paramsToSign = {
    timestamp,
    folder: effectiveFolder,
    ...(publicId ? { public_id: publicId } : {}),
  };
  const signature = signCloudinaryParams(paramsToSign, apiSecret);

  return res.status(200).json({
    cloudName,
    apiKey,
    folder: effectiveFolder,
    timestamp,
    publicId,
    signature,
  });
});

export default router;
