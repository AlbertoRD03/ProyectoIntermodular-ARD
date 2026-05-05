import { describe, it, expect, vi, beforeEach } from 'vitest';

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

let controller;

const createRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(async () => {
  vi.clearAllMocks();
  controller = await import('../../src/controllers/session.controller.js');
});

describe('session.controller', () => {
  it('registrarSesion validates user', async () => {
    const req = { user: { id: 'bad' }, body: {} };
    const res = createRes();

    await controller.registrarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('registrarSesion creates session and returns achievements', async () => {
    const req = {
      user: { id: 1 },
      body: { tipo_rutina: 'Pecho', ejercicios_realizados: [] }
    };
    const res = createRes();

    createSessionMock.mockResolvedValue({ id: '1' });
    checkAndUnlockAchievementsMock.mockResolvedValue([{ id: 1 }]);

    await controller.registrarSesion(req, res);

    expect(createSessionMock).toHaveBeenCalledWith(expect.objectContaining({
      usuario_id: 1,
      tipo_rutina: 'Pecho'
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Sesión registrada con éxito',
      session: { id: '1' },
      nuevosLogros: [{ id: 1 }]
    });
  });

  it('registrarSesion returns 400 when tipo_rutina missing', async () => {
    const req = { user: { id: 1 }, body: {} };
    const res = createRes();

    await controller.registrarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('obtenerHistorial returns sessions', async () => {
    const req = { user: { id: 1 } };
    const res = createRes();

    getSessionsByUserMock.mockResolvedValue([{ id: '1' }]);

    await controller.obtenerHistorial(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ items: [{ id: '1' }] });
  });

  it('obtenerHistorial returns 400 for invalid user', async () => {
    const req = { user: { id: 'bad' } };
    const res = createRes();

    await controller.obtenerHistorial(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('actualizarSesion returns 404 when missing', async () => {
    const req = { user: { id: 1 }, params: { id: '1' }, body: {} };
    const res = createRes();

    updateSessionMock.mockResolvedValue(null);

    await controller.actualizarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('actualizarSesion returns 400 for invalid user', async () => {
    const req = { user: { id: 'bad' }, params: { id: '1' }, body: {} };
    const res = createRes();

    await controller.actualizarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('eliminarSesion returns 200 when deleted', async () => {
    const req = { user: { id: 1 }, params: { id: '1' } };
    const res = createRes();

    deleteSessionMock.mockResolvedValue({ id: '1' });

    await controller.eliminarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Sesión eliminada' });
  });

  it('eliminarSesion returns 404 when missing', async () => {
    const req = { user: { id: 1 }, params: { id: '1' } };
    const res = createRes();

    deleteSessionMock.mockResolvedValue(null);

    await controller.eliminarSesion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('obtenerProgresoEjercicio validates params', async () => {
    const req = { user: { id: 1 }, params: { exerciseId: 'bad' } };
    const res = createRes();

    await controller.obtenerProgresoEjercicio(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('obtenerProgresoEjercicio returns history', async () => {
    const req = { user: { id: 1 }, params: { exerciseId: '3' } };
    const res = createRes();

    getExerciseHistoryMock.mockResolvedValue([{ id: 'h1' }]);

    await controller.obtenerProgresoEjercicio(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ items: [{ id: 'h1' }] });
  });
});
