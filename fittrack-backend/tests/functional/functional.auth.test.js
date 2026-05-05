import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const registerMock = vi.fn();
const loginMock = vi.fn();

vi.mock('../../src/services/auth.service.js', () => ({
  register: registerMock,
  login: loginMock,
  default: { register: registerMock, login: loginMock }
}));

let app;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  app = (await import('../../src/app.js')).default;
});

describe('functional auth routes', () => {
  it('POST /api/auth/register returns 201', async () => {
    registerMock.mockResolvedValue({ id: 1, nombre: 'Ana' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Ana', email: 'a@test.com', password: '123' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: 'Usuario registrado con éxito',
      user: { id: 1, nombre: 'Ana' }
    });
  });

  it('POST /api/auth/login returns 200', async () => {
    loginMock.mockResolvedValue({ user: { id: 1 }, token: 't' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@test.com', password: '123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: { id: 1 }, token: 't' });
  });
});
