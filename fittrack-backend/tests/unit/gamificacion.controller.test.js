import { describe, it, expect, vi, beforeEach } from 'vitest';

const checkLogrosMock = vi.fn();
const calculateGoalProgressMock = vi.fn();

vi.mock('../../src/services/gamificacion.service.js', () => ({
  checkLogros: checkLogrosMock,
  calculateGoalProgress: calculateGoalProgressMock,
  default: {
    checkLogros: checkLogrosMock,
    calculateGoalProgress: calculateGoalProgressMock
  }
}));

const findAllMock = vi.fn();
const createGoalMock = vi.fn();
const findGoalMock = vi.fn();

vi.mock('../../src/models/mysql/index.js', () => ({
  Achievement: {},
  UserAchievement: { findAll: findAllMock },
  PersonalGoal: { create: createGoalMock, findOne: findGoalMock }
}));

const goalProgressCreateMock = vi.fn();

vi.mock('../../src/models/mongodb/GoalProgress.js', () => ({
  create: goalProgressCreateMock,
  default: { create: goalProgressCreateMock }
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
  controller = await import('../../src/controllers/gamificacion.controller.js');
});

describe('gamificacion.controller', () => {
  it('listLogros returns user achievements', async () => {
    const req = { user: { id: 1 } };
    const res = createRes();

    checkLogrosMock.mockResolvedValue([]);
    findAllMock.mockResolvedValue([{ id: 1 }]);

    await controller.listLogros(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ items: [{ id: 1 }] });
  });

  it('createGoal validates required fields', async () => {
    const req = { user: { id: 1 }, body: { tipo: 'peso' } };
    const res = createRes();

    await controller.createGoal(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('createGoal returns 201 when created', async () => {
    const req = {
      user: { id: 1 },
      body: { tipo: 'peso', valor_inicial: 90, valor_objetivo: 80, unidad: 'kg' }
    };
    const res = createRes();

    createGoalMock.mockResolvedValue({ id: 1 });

    await controller.createGoal(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Objetivo creado con éxito',
      goal: { id: 1 }
    });
  });

  it('registerGoalProgress returns 201 with progress info', async () => {
    const req = {
      user: { id: 1 },
      params: { id: '3' },
      body: { valor_registrado: 80 }
    };
    const res = createRes();

    findGoalMock.mockResolvedValue({ id: 3, usuario_id: 1 });
    goalProgressCreateMock.mockResolvedValue({ id: 'p1' });
    calculateGoalProgressMock.mockResolvedValue({ progressPercent: 50 });

    await controller.registerGoalProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Progreso registrado con éxito',
      progress: { id: 'p1' },
      progressInfo: { progressPercent: 50 }
    });
  });

  it('registerGoalProgress returns 400 for invalid data', async () => {
    const req = { user: { id: 1 }, params: { id: '3' }, body: {} };
    const res = createRes();

    await controller.registerGoalProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('registerGoalProgress returns 404 when goal missing', async () => {
    const req = {
      user: { id: 1 },
      params: { id: '3' },
      body: { valor_registrado: 80 }
    };
    const res = createRes();

    findGoalMock.mockResolvedValue(null);

    await controller.registerGoalProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
