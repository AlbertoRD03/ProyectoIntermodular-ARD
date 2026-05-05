import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Op } from 'sequelize';

const findAllMock = vi.fn();

vi.mock('../../src/models/mysql/Exercise.js', () => ({
  findAll: findAllMock,
  default: { findAll: findAllMock }
}));

let service;

beforeEach(async () => {
  vi.clearAllMocks();
  service = await import('../../src/services/exercise.service.js');
});

describe('exercise.service', () => {
  it('applies grupo and search filters', async () => {
    findAllMock.mockResolvedValue([]);

    await service.getExercises({ grupo: 'Pecho', search: 'press' });

    expect(findAllMock).toHaveBeenCalledWith({
      where: {
        grupo_muscular: 'Pecho',
        nombre: { [Op.like]: '%press%' }
      },
      order: [['nombre', 'ASC']]
    });
  });

  it('applies only grupo filter', async () => {
    findAllMock.mockResolvedValue([]);

    await service.getExercises({ grupo: 'Pierna' });

    expect(findAllMock).toHaveBeenCalledWith({
      where: { grupo_muscular: 'Pierna' },
      order: [['nombre', 'ASC']]
    });
  });

  it('applies only search filter', async () => {
    findAllMock.mockResolvedValue([]);

    await service.getExercises({ search: 'curl' });

    expect(findAllMock).toHaveBeenCalledWith({
      where: { nombre: { [Op.like]: '%curl%' } },
      order: [['nombre', 'ASC']]
    });
  });

  it('returns all exercises when no filters', async () => {
    findAllMock.mockResolvedValue([]);

    await service.getExercises();

    expect(findAllMock).toHaveBeenCalledWith({
      where: {},
      order: [['nombre', 'ASC']]
    });
  });
});
