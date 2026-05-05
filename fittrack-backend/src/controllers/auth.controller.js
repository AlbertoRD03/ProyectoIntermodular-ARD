import { register as registerService, login as loginService } from '../services/auth.service.js';

export const register = async (req, res) => {
  try {
    const user = await registerService(req.body);
    res.status(201).json({ message: 'Usuario registrado con éxito', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginService(email, password);
    res.status(200).json(data);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
