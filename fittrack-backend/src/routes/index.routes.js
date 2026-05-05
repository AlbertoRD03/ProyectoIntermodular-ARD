import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import gamificacionRoutes from './gamificacion.routes.js';
import sessionRoutes from './session.routes.js';
import exerciseRoutes from './exercise.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import swaggerSpec from '../config/swagger.js';

const registerRoutes = (app) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    // Add your deployed frontend(s) here if needed.
  ];

  const corsOptions = {
    origin: (origin, cb) => {
      // Allow non-browser requests (no Origin) and allow-listed browser origins.
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
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
};

export default registerRoutes;
