import { describe, it, expect, vi, beforeEach } from 'vitest';

const findByPkMock = vi.fn();

vi.mock('../../src/models/mysql/User.js', () => ({
  findByPk: findByPkMock,
  default: { findByPk: findByPkMock }
}));

let checkOnboarding;

const createRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(async () => {
  vi.clearAllMocks();
  const module = await import('../../src/middlewares/checkOnboarding.middleware.js');
  checkOnboarding = module.default;
});

describe('checkOnboarding middleware', () => {
  it('returns 400 for invalid user', async () => {
    const req = { user: { id: 'bad' } };
    const res = createRes();
    const next = vi.fn();

    await checkOnboarding(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 404 when user missing', async () => {
    const req = { user: { id: 1 } };
    const res = createRes();
    const next = vi.fn();

    findByPkMock.mockResolvedValue(null);

    await checkOnboarding(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when onboarding pending', async () => {
    const req = { user: { id: 1 } };
    const res = createRes();
    const next = vi.fn();

    findByPkMock.mockResolvedValue({ onboarding_completado: false });

    await checkOnboarding(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when onboarding complete', async () => {
    const req = { user: { id: 1 } };
    const res = createRes();
    const next = vi.fn();

    findByPkMock.mockResolvedValue({ onboarding_completado: true });

    await checkOnboarding(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
