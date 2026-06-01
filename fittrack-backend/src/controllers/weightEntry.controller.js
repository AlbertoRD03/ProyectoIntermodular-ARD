import {
  createWeightEntry,
  deleteWeightEntry,
  listWeightEntriesByUser,
} from '../services/weightEntry.service.js';

export const listWeightEntries = async (req, res) => {
  try {
    const userId = String(req.user?.id || '').trim();
    if (!userId) return res.status(400).json({ error: 'Usuario inválido' });

    const fromRaw = req.query?.from;
    const toRaw = req.query?.to;
    const limitRaw = req.query?.limit;
    const from = fromRaw ? new Date(String(fromRaw)) : undefined;
    const to = toRaw ? new Date(String(toRaw)) : undefined;

    const items = await listWeightEntriesByUser(userId, { from, to, limit: limitRaw });
    return res.status(200).json({ items });
  } catch (e) {
    return res.status(500).json({ error: 'Error al obtener pesos' });
  }
};

export const addWeightEntry = async (req, res) => {
  try {
    const userId = String(req.user?.id || '').trim();
    if (!userId) return res.status(400).json({ error: 'Usuario inválido' });
    const entry = await createWeightEntry(userId, req.body);
    return res.status(201).json({ entry });
  } catch (e) {
    return res.status(400).json({ error: e?.message || 'Datos inválidos' });
  }
};

export const removeWeightEntry = async (req, res) => {
  try {
    const userId = String(req.user?.id || '').trim();
    if (!userId) return res.status(400).json({ error: 'Usuario inválido' });
    const id = String(req.params?.id || '').trim();
    if (!id) return res.status(400).json({ error: 'Id inválido' });

    const deleted = await deleteWeightEntry(id, userId);
    if (!deleted) return res.status(404).json({ error: 'Registro no encontrado' });
    return res.status(200).json({ message: 'Registro eliminado' });
  } catch (e) {
    return res.status(500).json({ error: 'Error al eliminar registro' });
  }
};

