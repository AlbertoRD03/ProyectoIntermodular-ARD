import { describe, it, expect, vi, beforeEach } from 'vitest';

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

vi.mock('../../src/models/mysql/User.js', () => ({
  default: {}
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
  controller = await import('../../src/controllers/user.controller.js');
});

describe('user.controller profile', () => {
  it('getProfile returns 400 for invalid user', async () => {
    const req = { user: { id: 'bad' } };
    const res = createRes();

    await controller.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('getProfile returns 404 when user missing', async () => {
    const req = { user: { id: 1 } };
    const res = createRes();

    getUserProfileMock.mockResolvedValue(null);

    await controller.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('getProfile returns user', async () => {
    const req = { user: { id: 1 } };
    const res = createRes();

    getUserProfileMock.mockResolvedValue({ id: 1, nombre: 'Ana' });

    await controller.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user: { id: 1, nombre: 'Ana' } });
  });

  it('updateProfile returns updated user', async () => {
    const req = { user: { id: 1 }, body: { peso_kg: 70 } };
    const res = createRes();

    updateUserProfileMock.mockResolvedValue({ id: 1, peso_kg: 70 });

    await controller.updateProfile(req, res);

    expect(updateUserProfileMock).toHaveBeenCalledWith(1, { peso_kg: 70 });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateProfile returns 400 for invalid user', async () => {
    const req = { user: { id: 'bad' }, body: { peso_kg: 70 } };
    const res = createRes();

    await controller.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updateProfile returns 404 when user missing', async () => {
    const req = { user: { id: 1 }, body: { peso_kg: 70 } };
    const res = createRes();

    updateUserProfileMock.mockResolvedValue(null);

    await controller.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deleteAccount returns confirmation', async () => {
    const req = { user: { id: 1 } };
    const res = createRes();

    deleteUserFullMock.mockResolvedValue({ deletedUser: 1, deletedSessions: 2 });

    await controller.deleteAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Cuenta eliminada permanentemente',
      result: { deletedUser: 1, deletedSessions: 2 }
    });
  });

  it('deleteAccount returns 400 for invalid user', async () => {
    const req = { user: { id: 'bad' } };
    const res = createRes();

    await controller.deleteAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deleteAccount returns 404 when user missing', async () => {
    const req = { user: { id: 1 } };
    const res = createRes();

    deleteUserFullMock.mockResolvedValue(null);

    await controller.deleteAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
