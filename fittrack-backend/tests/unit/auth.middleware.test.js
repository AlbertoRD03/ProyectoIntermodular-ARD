import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('jsonwebtoken', () => {
  const verify = vi.fn();
  return {
    verify,
    default: { verify }
  };
});

let verifyToken;
let jwt;

const createRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('auth.middleware', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    const [verifyTokenModule, jwtModule] = await Promise.all([
      import('../../src/middlewares/auth.middleware.js'),
      import('jsonwebtoken')
    ]);
    verifyToken = verifyTokenModule.default ?? verifyTokenModule;
    jwt = jwtModule.default ?? jwtModule;
  });

  it('returns 401 when token is missing', () => {
    const req = { headers: {} };
    const res = createRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Acceso denegado. No hay token.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when token is invalid', () => {
    const req = { headers: { authorization: 'Bearer bad-token' } };
    const res = createRes();
    const next = vi.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error('invalid');
    });

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token no válido o expirado.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and sets req.user when token is valid', () => {
    const req = { headers: { authorization: 'Bearer good-token' } };
    const res = createRes();
    const next = vi.fn();

    jwt.verify.mockReturnValue({ id: 1, email: 'user@test.com' });

    verifyToken(req, res, next);

    expect(req.user).toEqual({ id: 1, email: 'user@test.com' });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
