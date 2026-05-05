import { describe, it, expect, vi, beforeEach } from 'vitest';

const userFindByPkMock = vi.fn();

vi.mock('../../src/models/mysql/User.js', () => ({
  findByPk: userFindByPkMock,
  default: { findByPk: userFindByPkMock }
}));

let User;
let userController;

const createRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('user.controller', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const [UserModule, userControllerModule] = await Promise.all([
      import('../../src/models/mysql/User.js'),
      import('../../src/controllers/user.controller.js')
    ]);
    User = UserModule.default ?? UserModule;
    userController = userControllerModule;
  });

  it('completeOnboarding updates user and returns 200', async () => {
    const req = {
      user: { id: 5 },
      body: {
        fecha_nacimiento: '2000-01-01',
        genero: 'Masculino',
        altura_cm: 180,
        peso_kg: 80,
        nivel_experiencia: 'Intermedio',
        objetivo_principal: 'Fuerza'
      }
    };
    const res = createRes();

    const update = vi.fn().mockResolvedValue();
    const user = { id: 5, update };
    User.findByPk.mockResolvedValue(user);

    await userController.completeOnboarding(req, res);

    expect(User.findByPk).toHaveBeenCalledWith(5);
    expect(update).toHaveBeenCalledWith({
      ...req.body,
      onboarding_completado: true
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Onboarding completado con éxito',
      user
    });
  });

  it('completeOnboarding returns 404 when user is missing', async () => {
    const req = { user: { id: 99 }, body: {} };
    const res = createRes();

    User.findByPk.mockResolvedValue(null);

    await userController.completeOnboarding(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
  });

  it('completeOnboarding returns 500 on unexpected error', async () => {
    const req = { user: { id: 1 }, body: {} };
    const res = createRes();

    User.findByPk.mockRejectedValue(new Error('db error'));

    await userController.completeOnboarding(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al actualizar el perfil' });
  });
});
