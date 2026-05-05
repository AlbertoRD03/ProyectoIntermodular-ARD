import { describe, it, expect, vi, beforeEach } from 'vitest';

const countDocumentsMock = vi.fn();

vi.mock('../../src/models/mongodb/Session.js', () => ({
  countDocuments: countDocumentsMock,
  default: { countDocuments: countDocumentsMock }
}));

const userFindByPkMock = vi.fn();
const addAchievementMock = vi.fn();
const achievementFindOrCreateMock = vi.fn();
const userAchievementFindOrCreateMock = vi.fn();

vi.mock('../../src/models/mysql/index.js', () => ({
  User: {
    findByPk: userFindByPkMock
  },
  Achievement: {
    findOrCreate: achievementFindOrCreateMock
  },
  UserAchievement: {
    findOrCreate: userAchievementFindOrCreateMock
  },
  PersonalGoal: {}
}));

let service;

beforeEach(async () => {
  vi.clearAllMocks();
  service = await import('../../src/services/gamificacion.service.js');
});

describe('gamificacion.service', () => {
  it('unlocks achievements based on session count', async () => {
    countDocumentsMock.mockResolvedValue(5);

    userFindByPkMock.mockResolvedValue({
      Achievements: [],
      addAchievement: addAchievementMock
    });

    achievementFindOrCreateMock
      .mockResolvedValueOnce([{ id: 1, nombre: 'Primer Paso' }])
      .mockResolvedValueOnce([{ id: 2, nombre: 'Constancia de Hierro' }]);

    const result = await service.checkAndUnlockAchievements(1);

    expect(addAchievementMock).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
  });

  it('throws when user not found', async () => {
    countDocumentsMock.mockResolvedValue(1);
    userFindByPkMock.mockResolvedValue(null);

    await expect(service.checkAndUnlockAchievements(1))
      .rejects
      .toThrow('Usuario no encontrado');
  });

  it('returns empty when session count below thresholds', async () => {
    countDocumentsMock.mockResolvedValue(0);
    userFindByPkMock.mockResolvedValue({
      Achievements: [],
      addAchievement: addAchievementMock
    });

    const result = await service.checkAndUnlockAchievements(1);

    expect(result).toEqual([]);
    expect(achievementFindOrCreateMock).not.toHaveBeenCalled();
    expect(addAchievementMock).not.toHaveBeenCalled();
  });

  it('skips already unlocked achievements', async () => {
    countDocumentsMock.mockResolvedValue(1);
    userFindByPkMock.mockResolvedValue({
      Achievements: [{ id: 1 }],
      addAchievement: addAchievementMock
    });

    const result = await service.checkAndUnlockAchievements(1);

    expect(result).toEqual([]);
    expect(addAchievementMock).not.toHaveBeenCalled();
  });

  it('checkLogros throws when userId missing', async () => {
    await expect(service.checkLogros())
      .rejects
      .toThrow('userId requerido');
  });

  it('checkLogros returns empty when below threshold', async () => {
    countDocumentsMock.mockResolvedValue(0);
    achievementFindOrCreateMock.mockResolvedValue([{ id: 99 }]);
    userAchievementFindOrCreateMock.mockResolvedValue([{}, false]);

    const result = await service.checkLogros(1);

    expect(result).toEqual([]);
    expect(achievementFindOrCreateMock).not.toHaveBeenCalled();
  });
});
