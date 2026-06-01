import { API_BASE } from '../config/apiBase';
import { getAuthToken } from './authToken';

export async function uploadImageToCloudinary({ file, publicIdPrefix = 'fitgram', folderHint = '' } = {}) {
  if (!file) throw new Error('Missing file');
  const token = getAuthToken();
  if (!token) throw new Error('Missing auth token');

  const publicId = `${publicIdPrefix}_${Date.now()}`;
  const sigRes = await fetch(
    `${API_BASE}/uploads/cloudinary-signature?public_id=${encodeURIComponent(publicId)}${folderHint ? `&folder=${encodeURIComponent(folderHint)}` : ''}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const sig = await sigRes.json().catch(() => ({}));
  if (!sigRes.ok) {
    throw new Error(sig?.error || sig?.message || 'Unable to sign upload');
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(sig.cloudName)}/image/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  if (sig.folder) form.append('folder', sig.folder);
  if (sig.publicId) form.append('public_id', sig.publicId);

  const upRes = await fetch(uploadUrl, { method: 'POST', body: form });
  const upData = await upRes.json().catch(() => ({}));
  if (!upRes.ok) {
    throw new Error(upData?.error?.message || 'Upload failed');
  }

  const url = String(upData?.secure_url || upData?.url || '').trim();
  if (!url) throw new Error('Upload returned no URL');
  return { url, publicId: sig.publicId || publicId };
}

