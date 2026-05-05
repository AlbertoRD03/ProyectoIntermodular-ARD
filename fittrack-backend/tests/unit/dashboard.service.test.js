import { describe, it, expect, vi, beforeEach } from 'vitest';

const aggregateMock = vi.fn();
const findOneMock = vi.fn();

vi.mock('../../src/models/mongodb/Session.js', () => ({
  aggregate: aggregateMock,
  findOne: findOneMock,
  default: { aggregate: aggregateMock, findOne: findOneMock }
}));

let service;

beforeEach(async () => {
  vi.clearAllMocks();
  service = await import('../../src/services/dashboard.service.js');
});

describe('dashboard.service', () => {
  it('getWeeklyWorkload maps and rounds data', async () => {
    aggregateMock.mockResolvedValue([
      { _id: '2026-02-01', volumen_total: 1234.567 }
    ]);

    const result = await service.getWeeklyWorkload(1);

    expect(aggregateMock).toHaveBeenCalled();
    expect(result).toEqual([
      { fecha: '2026-02-01', volumen_total: 1234.57 }
    ]);
  });

  it('getMuscleDistribution maps data', async () => {
    aggregateMock.mockResolvedValue([
      { _id: 'Press Banca', total: 3 }
    ]);

    const result = await service.getMuscleDistribution(1);

    expect(result).toEqual([
      { ejercicio: 'Press Banca', total: 3 }
    ]);
  });

  it('getLifetimeStats returns zeros when no sessions', async () => {
    const chain = { sort: () => ({ lean: () => null }) };
    findOneMock.mockReturnValueOnce(chain).mockReturnValueOnce(chain);

    const result = await service.getLifetimeStats(1);

    expect(result).toEqual({
      firstSessionDate: null,
      lastSessionDate: null,
      firstIntensity: 0,
      lastIntensity: 0,
      improvementPercent: 0,
      totalVolume: 0
    });
    expect(aggregateMock).not.toHaveBeenCalled();
  });

  it('getLifetimeStats calculates improvements', async () => {
    const firstSession = {
      fecha: new Date('2026-01-01'),
      ejercicios_realizados: [
        { sets: [{ reps: 10, peso: 50 }] }
      ]
    };
    const lastSession = {
      fecha: new Date('2026-02-01'),
      ejercicios_realizados: [
        { sets: [{ reps: 10, peso: 70 }] }
      ]
    };

    findOneMock
      .mockReturnValueOnce({ sort: () => ({ lean: () => firstSession }) })
      .mockReturnValueOnce({ sort: () => ({ lean: () => lastSession }) });

    aggregateMock.mockResolvedValue([{ total: 2000 }]);

    const result = await service.getLifetimeStats(1);

    expect(result.firstIntensity).toBe(50);
    expect(result.lastIntensity).toBe(70);
    expect(result.improvementPercent).toBe(40);
    expect(result.totalVolume).toBe(2000);
  });

  it('getLifetimeStats handles zero intensity and empty total volume', async () => {
    const firstSession = {
      fecha: new Date('2026-01-01'),
      ejercicios_realizados: []
    };
    const lastSession = {
      fecha: new Date('2026-02-01'),
      ejercicios_realizados: []
    };

    findOneMock
      .mockReturnValueOnce({ sort: () => ({ lean: () => firstSession }) })
      .mockReturnValueOnce({ sort: () => ({ lean: () => lastSession }) });

    aggregateMock.mockResolvedValue([]);

    const result = await service.getLifetimeStats(1);

    expect(result.firstIntensity).toBe(0);
    expect(result.lastIntensity).toBe(0);
    expect(result.improvementPercent).toBe(0);
    expect(result.totalVolume).toBe(0);
  });
});
