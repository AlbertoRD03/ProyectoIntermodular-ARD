import { describe, it, expect, vi, beforeEach } from 'vitest';

const registerMock = vi.fn();
const loginMock = vi.fn();

vi.mock('../../src/services/auth.service.js', () => ({
  register: registerMock,
  login: loginMock,
  default: { register: registerMock, login: loginMock }
}));

let authService;
let authController;

const createRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('auth.controller', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const [authServiceModule, authControllerModule] = await Promise.all([
      import('../../src/services/auth.service.js'),
      import('../../src/controllers/auth.controller.js')
    ]);
    authService = authServiceModule;
    authController = authControllerModule;
  });

  it('register returns 201 with user data', async () => {
    const req = { body: { nombre: 'Ana' } };
    const res = createRes();

    authService.register.mockResolvedValue({ id: 1, nombre: 'Ana' });

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Usuario registrado con éxito',
      user: { id: 1, nombre: 'Ana' }
    });
  });

  it('register returns 400 when service fails', async () => {
    const req = { body: { nombre: 'Ana' } };
    const res = createRes();

    authService.register.mockRejectedValue(new Error('fallo'));

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'fallo' });
  });

  it('login returns 200 with token and user', async () => {
    const req = { body: { email: 'a@test.com', password: 'pass' } };
    const res = createRes();

    authService.login.mockResolvedValue({
      user: { id: 1, email: 'a@test.com' },
      token: 'token-123'
    });

    await authController.login(req, res);

    expect(authService.login).toHaveBeenCalledWith('a@test.com', 'pass');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      user: { id: 1, email: 'a@test.com' },
      token: 'token-123'
    });
  });

  it('login returns 401 when service fails', async () => {
    const req = { body: { email: 'a@test.com', password: 'pass' } };
    const res = createRes();

    authService.login.mockRejectedValue(new Error('credenciales'));

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'credenciales' });
  });
});
