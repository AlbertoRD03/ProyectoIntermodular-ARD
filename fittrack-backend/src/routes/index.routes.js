import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import gamificacionRoutes from './gamificacion.routes.js';
import sessionRoutes from './session.routes.js';
import exerciseRoutes from './exercise.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import catalogRoutes from './catalog.routes.js';
import swaggerSpec from '../config/swagger.js';

const registerRoutes = (app) => {
  const envAllowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://proyectointermodularard.vercel.app',
    ...envAllowedOrigins,
  ];

  const allowedOriginRegexes = [
    /^https:\/\/proyectointermodularard[a-z0-9-]*\.vercel\.app$/i,
  ];

  const corsOptions = {
    origin: (origin, cb) => {
      // Allow non-browser requests (no Origin) and allow-listed browser origins.
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOriginRegexes.some((re) => re.test(origin))
      ) {
        return cb(null, true);
      }
      return cb(new Error(`CORS: Origin not allowed: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };

  app.use(cors(corsOptions));
  // Ensure preflight requests succeed for all routes.
  app.options('*', cors(corsOptions));
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/gamificacion', gamificacionRoutes);
  app.use('/api/sesiones', sessionRoutes);
  app.use('/api/ejercicios', exerciseRoutes);
  app.use('/api/catalog', catalogRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: { persistAuthorization: true }
    })
  );

  app.get('/', (req, res) => {
    res.send('Servidor de FitTrack operativo 🚀');
  });

  // Middleware de error para errores no capturados
  app.use((err, req, res, _next) => {
    console.error('Error no capturado:', err);
    if (err?.message?.startsWith('CORS:')) {
      return res.status(403).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  });
};

export default registerRoutes;
