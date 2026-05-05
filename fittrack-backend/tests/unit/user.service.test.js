import { describe, it, expect, vi, beforeEach } from 'vitest';

const findByPkMock = vi.fn();
const updateMock = vi.fn();
const destroyMock = vi.fn();

vi.mock('../../src/models/mysql/User.js', () => ({
  findByPk: findByPkMock,
  update: updateMock,
  destroy: destroyMock,
  default: { findByPk: findByPkMock, update: updateMock, destroy: destroyMock }
}));

const deleteManyMock = vi.fn();

vi.mock('../../src/models/mongodb/Session.js', () => ({
  deleteMany: deleteManyMock,
  default: { deleteMany: deleteManyMock }
}));

let service;

beforeEach(async () => {
  vi.clearAllMocks();
  service = await import('../../src/services/user.service.js');
});

describe('user.service', () => {
  it('getUserProfile excludes password', async () => {
    findByPkMock.mockResolvedValue({ id: 1, nombre: 'Ana' });

    const result = await service.getUserProfile(1);

    expect(findByPkMock).toHaveBeenCalledWith(1, {
      attributes: { exclude: ['password'] }
    });
    expect(result).toEqual({ id: 1, nombre: 'Ana' });
  });

  it('updateUserProfile returns null when no rows updated', async () => {
    updateMock.mockResolvedValue([0]);

    const result = await service.updateUserProfile(1, { peso_kg: 70 });

    expect(updateMock).toHaveBeenCalledWith({ peso_kg: 70 }, { where: { id: 1 } });
    expect(result).toBeNull();
  });

  it('updateUserProfile returns updated user', async () => {
    updateMock.mockResolvedValue([1]);
    findByPkMock.mockResolvedValue({ id: 1, nombre: 'Ana' });

    const result = await service.updateUserProfile(1, { peso_kg: 70 });

    expect(findByPkMock).toHaveBeenCalledWith(1, {
      attributes: { exclude: ['password'] }
    });
    expect(result).toEqual({ id: 1, nombre: 'Ana' });
  });

  it('deleteUserFull returns null when user not found', async () => {
    findByPkMock.mockResolvedValue(null);

    const result = await service.deleteUserFull(1);

    expect(result).toBeNull();
    expect(destroyMock).not.toHaveBeenCalled();
    expect(deleteManyMock).not.toHaveBeenCalled();
  });

  it('deleteUserFull removes user and sessions', async () => {
    findByPkMock.mockResolvedValue({ id: 1 });
    destroyMock.mockResolvedValue(1);
    deleteManyMock.mockResolvedValue({ deletedCount: 3 });

    const result = await service.deleteUserFull(1);

    expect(destroyMock).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(deleteManyMock).toHaveBeenCalledWith({ usuario_id: 1 });
    expect(result).toEqual({ deletedUser: 1, deletedSessions: 3 });
  });
});
