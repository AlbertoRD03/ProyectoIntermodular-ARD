import {
  createChallenge,
  listChallenges,
  updateChallengeStatus
} from '../services/challenge.service.js';
import { getErrorStatus, shouldExposeErrorMessage } from '../utils/httpError.js';
import { isMySQLEnabled } from '../utils/mysqlEnabled.js';

const fail = (res, error, fallbackMessage) => {
  const status = getErrorStatus(error, 500);
  const message = shouldExposeErrorMessage(error) ? error.message : fallbackMessage;
  return res.status(status).json({ message });
};

export const createChallengeController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });
    const challenge = await createChallenge({ creatorId: req.user?.id, ...(req.body || {}) });
    return res.status(201).json({ challenge });
  } catch (error) {
    return fail(res, error, 'Error al crear el reto');
  }
};

export const listChallengesController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });
    const challenges = await listChallenges({ userId: req.user?.id, status: req.query?.status });
    return res.status(200).json({ challenges });
  } catch (error) {
    return fail(res, error, 'Error al cargar retos');
  }
};

export const updateChallengeStatusController = async (req, res) => {
  try {
    if (isMySQLEnabled()) return res.status(501).json({ message: 'Funcionalidad no disponible en MySQL.' });
    const challenge = await updateChallengeStatus({
      userId: req.user?.id,
      challengeId: req.params?.id,
      status: req.body?.status,
    });
    return res.status(200).json({ challenge });
  } catch (error) {
    return fail(res, error, 'Error al actualizar el reto');
  }
};
