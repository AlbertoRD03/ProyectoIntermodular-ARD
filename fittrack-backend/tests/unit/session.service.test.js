import { describe, it, expect, vi, beforeEach } from 'vitest';

const createMock = vi.fn();
const findMock = vi.fn();
const findOneAndUpdateMock = vi.fn();
const findOneAndDeleteMock = vi.fn();
const aggregateMock = vi.fn();

vi.mock('../../src/models/mongodb/Session.js', () => ({
  create: createMock,
  find: findMock,
  findOneAndUpdate: findOneAndUpdateMock,
  findOneAndDelete: findOneAndDeleteMock,
  aggregate: aggregateMock,
  default: {
    create: createMock,
    find: findMock,
    findOneAndUpdate: findOneAndUpdateMock,
    findOneAndDelete: findOneAndDeleteMock,
    aggregate: aggregateMock
  }
}));

let service;

beforeEach(async () => {
  vi.clearAllMocks();
  service = await import('../../src/services/session.service.js');
});

describe('session.service', () => {
  it('createSession delegates to Session.create', async () => {
    createMock.mockResolvedValue({ id: '1' });

    const result = await service.createSession({ usuario_id: 1 });

    expect(createMock).toHaveBeenCalledWith({ usuario_id: 1 });
    expect(result).toEqual({ id: '1' });
  });

  it('getSessionsByUser sorts by date desc', async () => {
    const sortMock = vi.fn().mockResolvedValue([{ id: '1' }]);
    findMock.mockReturnValue({ sort: sortMock });

    const result = await service.getSessionsByUser(1);

    expect(findMock).toHaveBeenCalledWith({ usuario_id: 1 });
    expect(sortMock).toHaveBeenCalledWith({ fecha: -1 });
    expect(result).toEqual([{ id: '1' }]);
  });

  it('updateSession uses findOneAndUpdate', async () => {
    findOneAndUpdateMock.mockResolvedValue({ id: '1' });

    const result = await service.updateSession('1', 1, { notas: 'ok' });

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: '1', usuario_id: 1 },
      { notas: 'ok' },
      { new: true }
    );
    expect(result).toEqual({ id: '1' });
  });

  it('deleteSession uses findOneAndDelete', async () => {
    findOneAndDeleteMock.mockResolvedValue({ id: '1' });

    const result = await service.deleteSession('1', 1);

    expect(findOneAndDeleteMock).toHaveBeenCalledWith({ _id: '1', usuario_id: 1 });
    expect(result).toEqual({ id: '1' });
  });

  it('getExerciseHistory uses aggregate pipeline', async () => {
    aggregateMock.mockResolvedValue([{ ejercicio: { ejercicio_id: 3 } }]);

    const result = await service.getExerciseHistory(1, 3);

    expect(aggregateMock).toHaveBeenCalled();
    expect(result).toEqual([{ ejercicio: { ejercicio_id: 3 } }]);
  });
});
