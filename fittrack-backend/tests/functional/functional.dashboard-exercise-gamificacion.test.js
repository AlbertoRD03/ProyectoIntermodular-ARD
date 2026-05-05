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

const getExercisesMock = vi.fn();

vi.mock('../../src/services/exercise.service.js', () => ({
  getExercises: getExercisesMock,
  default: { getExercises: getExercisesMock }
}));

const getWeeklyWorkloadMock = vi.fn();
const getMuscleDistributionMock = vi.fn();
const getLifetimeStatsMock = vi.fn();

vi.mock('../../src/services/dashboard.service.js', () => ({
  getWeeklyWorkload: getWeeklyWorkloadMock,
  getMuscleDistribution: getMuscleDistributionMock,
  getLifetimeStats: getLifetimeStatsMock,
  default: {
    getWeeklyWorkload: getWeeklyWorkloadMock,
    getMuscleDistribution: getMuscleDistributionMock,
    getLifetimeStats: getLifetimeStatsMock
  }
}));

const checkLogrosMock = vi.fn();
const calculateGoalProgressMock = vi.fn();

vi.mock('../../src/services/gamificacion.service.js', () => ({
  checkLogros: checkLogrosMock,
  calculateGoalProgress: calculateGoalProgressMock,
  default: { checkLogros: checkLogrosMock, calculateGoalProgress: calculateGoalProgressMock }
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

let app;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  app = (await import('../../src/app.js')).default;
});

describe('functional dashboard/exercise/gamificacion routes', () => {
  it('GET /api/ejercicios returns list', async () => {
    getExercisesMock.mockResolvedValue([{ id: 1 }]);

    const res = await request(app).get('/api/ejercicios?grupo=Pecho');

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([{ id: 1 }]);
  });

  it('GET /api/dashboard/stats returns payload', async () => {
    getWeeklyWorkloadMock.mockResolvedValue([]);
    getMuscleDistributionMock.mockResolvedValue([]);
    getLifetimeStatsMock.mockResolvedValue({ totalVolume: 0 });

    const res = await request(app).get('/api/dashboard/stats');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      weeklyWorkload: [],
      muscleDistribution: [],
      lifetimeStats: { totalVolume: 0 }
    });
  });

  it('GET /api/gamificacion/logros returns items', async () => {
    checkLogrosMock.mockResolvedValue([]);
    findAllMock.mockResolvedValue([{ id: 1 }]);

    const res = await request(app).get('/api/gamificacion/logros');

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([{ id: 1 }]);
  });

  it('POST /api/gamificacion/objetivos creates goal', async () => {
    createGoalMock.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .post('/api/gamificacion/objetivos')
      .send({ tipo: 'peso', valor_inicial: 90, valor_objetivo: 80, unidad: 'kg' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Objetivo creado con éxito');
  });

  it('POST /api/gamificacion/objetivos/:id/progreso registers progress', async () => {
    findGoalMock.mockResolvedValue({ id: 1, usuario_id: 1 });
    goalProgressCreateMock.mockResolvedValue({ id: 'p1' });
    calculateGoalProgressMock.mockResolvedValue({ progressPercent: 50 });

    const res = await request(app)
      .post('/api/gamificacion/objetivos/1/progreso')
      .send({ valor_registrado: 85 });

    expect(res.status).toBe(201);
    expect(res.body.progressInfo).toEqual({ progressPercent: 50 });
  });
});
