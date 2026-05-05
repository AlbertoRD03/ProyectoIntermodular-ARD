import express from 'express';
import registerRoutes from './routes/index.routes.js';

const app = express();

registerRoutes(app);

export default app;
