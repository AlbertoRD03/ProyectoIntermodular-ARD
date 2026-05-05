import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../../src/middlewares/auth.middleware.js', () => ({
  default: (req, _res, next) => {
    req.user = { id: 1 };
    next();
  }
}));

vi.mock('../../src/middlewares/checkOnboarding.middleware.js', () => ({
  default: (_req, _res, next) => next()
}));

const getUserProfileMock = vi.fn();
const updateUserProfileMock = vi.fn();
const deleteUserFullMock = vi.fn();

vi.mock('../../src/services/user.service.js', () => ({
  getUserProfile: getUserProfileMock,
  updateUserProfile: updateUserProfileMock,
  deleteUserFull: deleteUserFullMock,
  default: {
    getUserProfile: getUserProfileMock,
    updateUserProfile: updateUserProfileMock,
    deleteUserFull: deleteUserFullMock
  }
}));

const createSessionMock = vi.fn();
const getSessionsByUserMock = vi.fn();
const updateSessionMock = vi.fn();
const deleteSessionMock = vi.fn();
const getExerciseHistoryMock = vi.fn();

vi.mock('../../src/services/session.service.js', () => ({
  createSession: createSessionMock,
  getSessionsByUser: getSessionsByUserMock,
  updateSession: updateSessionMock,
  deleteSession: deleteSessionMock,
  getExerciseHistory: getExerciseHistoryMock,
  default: {
    createSession: createSessionMock,
    getSessionsByUser: getSessionsByUserMock,
    updateSession: updateSessionMock,
    deleteSession: deleteSessionMock,
    getExerciseHistory: getExerciseHistoryMock
  }
}));

const checkAndUnlockAchievementsMock = vi.fn();

vi.mock('../../src/services/gamificacion.service.js', () => ({
  checkAndUnlockAchievements: checkAndUnlockAchievementsMock,
  default: { checkAndUnlockAchievements: checkAndUnlockAchievementsMock }
}));

let app;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  app = (await import('../../src/app.js')).default;
});

describe('functional user profile routes', () => {
  it('GET /api/users/profile returns profile', async () => {
    getUserProfileMock.mockResolvedValue({ id: 1, nombre: 'Ana' });

    const res = await request(app).get('/api/users/profile');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: { id: 1, nombre: 'Ana' } });
  });

  it('PUT /api/users/profile updates profile', async () => {
    updateUserProfileMock.mockResolvedValue({ id: 1, peso_kg: 70 });

    const res = await request(app)
      .put('/api/users/profile')
      .send({ peso_kg: 70 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Perfil actualizado');
  });

  it('DELETE /api/users/profile deletes account', async () => {
    deleteUserFullMock.mockResolvedValue({ deletedUser: 1, deletedSessions: 2 });

    const res = await request(app).delete('/api/users/profile');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Cuenta eliminada permanentemente');
  });
});

describe('functional session routes', () => {
  it('POST /api/sesiones creates session', async () => {
    createSessionMock.mockResolvedValue({ id: 's1' });
    checkAndUnlockAchievementsMock.mockResolvedValue([{ id: 1 }]);

    const res = await request(app)
      .post('/api/sesiones')
      .send({ tipo_rutina: 'Pecho', ejercicios_realizados: [] });

    expect(res.status).toBe(201);
    expect(res.body.nuevosLogros).toEqual([{ id: 1 }]);
  });

  it('GET /api/sesiones/historial returns list', async () => {
    getSessionsByUserMock.mockResolvedValue([{ id: 's1' }]);

    const res = await request(app).get('/api/sesiones/historial');

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([{ id: 's1' }]);
  });

  it('GET /api/sesiones/ejercicio/:id returns history', async () => {
    getExerciseHistoryMock.mockResolvedValue([{ id: 'h1' }]);

    const res = await request(app).get('/api/sesiones/ejercicio/3');

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([{ id: 'h1' }]);
  });
});
