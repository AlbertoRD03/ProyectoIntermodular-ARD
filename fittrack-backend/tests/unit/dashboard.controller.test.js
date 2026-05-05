import { describe, it, expect, vi, beforeEach } from 'vitest';

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

let controller;

const createRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(async () => {
  vi.clearAllMocks();
  controller = await import('../../src/controllers/dashboard.controller.js');
});

describe('dashboard.controller', () => {
  it('returns 400 for invalid user', async () => {
    const req = { user: { id: 'bad' } };
    const res = createRes();

    await controller.getFullStats(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns stats payload', async () => {
    const req = { user: { id: 1 } };
    const res = createRes();

    getWeeklyWorkloadMock.mockResolvedValue([{ fecha: 'x', volumen_total: 1 }]);
    getMuscleDistributionMock.mockResolvedValue([{ ejercicio: 'A', total: 2 }]);
    getLifetimeStatsMock.mockResolvedValue({ totalVolume: 100 });

    await controller.getFullStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      weeklyWorkload: [{ fecha: 'x', volumen_total: 1 }],
      muscleDistribution: [{ ejercicio: 'A', total: 2 }],
      lifetimeStats: { totalVolume: 100 }
    });
  });
});
