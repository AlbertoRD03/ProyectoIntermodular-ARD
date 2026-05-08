import { register as registerService, login as loginService } from '../services/auth.service.js';
import { isMySQLDisabledError } from '../utils/mysqlEnabled.js';

export const register = async (req, res) => {
  try {
    const user = await registerService(req.body);
    res.status(201).json({ message: 'Usuario registrado con éxito', user });
  } catch (error) {
    console.error('Error en register:', error);
    const status = isMySQLDisabledError(error) ? 503 : 400;
    res.status(status).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginService(email, password);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error en login:', error);
    const status = isMySQLDisabledError(error) ? 503 : 401;
    res.status(status).json({ message: error.message });
  }
};
