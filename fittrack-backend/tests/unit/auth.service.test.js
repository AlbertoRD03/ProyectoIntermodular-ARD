import { describe, it, expect, vi, beforeEach } from 'vitest';

const userCreateMock = vi.fn();
const userFindOneMock = vi.fn();

vi.mock('../../src/models/mysql/User.js', () => ({
  create: userCreateMock,
  findOne: userFindOneMock,
  default: { create: userCreateMock, findOne: userFindOneMock }
}));

const bcryptHashMock = vi.fn();
const bcryptCompareMock = vi.fn();

vi.mock('bcrypt', () => ({
  hash: bcryptHashMock,
  compare: bcryptCompareMock,
  default: { hash: bcryptHashMock, compare: bcryptCompareMock }
}));

const jwtSignMock = vi.fn();

vi.mock('jsonwebtoken', () => ({
  sign: jwtSignMock,
  default: { sign: jwtSignMock }
}));

let authService;
let User;
let bcrypt;
let jwt;

describe('auth.service', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';

    const [
      authServiceModule,
      UserModule,
      bcryptModule,
      jwtModule
    ] = await Promise.all([
      import('../../src/services/auth.service.js'),
      import('../../src/models/mysql/User.js'),
      import('bcrypt'),
      import('jsonwebtoken')
    ]);

    authService = authServiceModule;
    User = UserModule.default ?? UserModule;
    bcrypt = bcryptModule.default ?? bcryptModule;
    jwt = jwtModule.default ?? jwtModule;
  });

  it('register hashes the password and creates the user', async () => {
    const userData = { nombre: 'Ana', email: 'ana@test.com', password: 'plain' };
    const createdUser = { id: 1, ...userData, password: 'hashed' };

    bcrypt.hash.mockResolvedValue('hashed');
    User.create.mockResolvedValue(createdUser);

    const result = await authService.register(userData);

    expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
    expect(User.create).toHaveBeenCalledWith({ ...userData, password: 'hashed' });
    expect(result).toEqual(createdUser);
  });

  it('login returns user and token when credentials are valid', async () => {
    const user = { id: 7, email: 'user@test.com', password: 'hashed' };

    User.findOne.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token-123');

    const result = await authService.login('user@test.com', 'plain');

    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'user@test.com' } });
    expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed');
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 7, email: 'user@test.com' },
      'test-secret',
      { expiresIn: '24h' }
    );
    expect(result).toEqual({ user, token: 'token-123' });
  });

  it('login throws when user is not found', async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.compare.mockResolvedValue(false);

    await expect(authService.login('missing@test.com', 'plain'))
      .rejects
      .toThrow('Usuario no encontrado');

    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('login throws when password does not match', async () => {
    const user = { id: 1, email: 'user@test.com', password: 'hashed' };

    User.findOne.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);
    jwt.sign.mockReturnValue('token-should-not-be-used');

    await expect(authService.login('user@test.com', 'bad'))
      .rejects
      .toThrow('Contraseña incorrecta');

    expect(jwt.sign).not.toHaveBeenCalled();
  });
});
