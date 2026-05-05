import { describe, it, expect, vi, beforeEach } from 'vitest';

const getExercisesMock = vi.fn();

vi.mock('../../src/services/exercise.service.js', () => ({
  getExercises: getExercisesMock,
  default: { getExercises: getExercisesMock }
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
  controller = await import('../../src/controllers/exercise.controller.js');
});

describe('exercise.controller', () => {
  it('returns exercises list', async () => {
    const req = { query: { grupo: 'Pecho', search: 'press' } };
    const res = createRes();

    getExercisesMock.mockResolvedValue([{ id: 1 }]);

    await controller.getAllExercises(req, res);

    expect(getExercisesMock).toHaveBeenCalledWith({ grupo: 'Pecho', search: 'press' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ items: [{ id: 1 }] });
  });

  it('handles errors', async () => {
    const req = { query: {} };
    const res = createRes();

    getExercisesMock.mockRejectedValue(new Error('fail'));

    await controller.getAllExercises(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
