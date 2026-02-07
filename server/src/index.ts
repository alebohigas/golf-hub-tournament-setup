/**
 * Golf Tournament API Server
 * Main entry point - Express server with CORS and MySQL
 * Replaces all PHP endpoints with typed TypeScript routes
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './db';

// Route imports
import { menuRouter } from './routes/menu';
import { sponsorsRouter } from './routes/sponsors';
import { tournamentRouter } from './routes/tournament';
import { categoriesRouter } from './routes/categories';
import { playersRouter } from './routes/players';
import { calendarioRouter } from './routes/calendario';
import { resultadosRouter } from './routes/resultados';
import { salidasRouter } from './routes/salidas';
import { competicionRouter } from './routes/competicion';
import { competenciasRouter } from './routes/competencias';
import { eventosRouter } from './routes/eventos';

dotenv.config();

// ============= App Setup =============
const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// ============= Middleware =============

/** CORS - Allow frontend origins */
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:8080')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/** JSON body parser */
app.use(express.json());

/** Request logger (dev only) */
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// ============= Routes =============

/** Health check endpoint */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/** Mount all route modules */
app.use('/api/menu', menuRouter);
app.use('/api/sponsors', sponsorsRouter);
app.use('/api/tournament', tournamentRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/players', playersRouter);
app.use('/api/calendario', calendarioRouter);
app.use('/api/resultados', resultadosRouter);
app.use('/api/salidas', salidasRouter);
app.use('/api/competicion', competicionRouter);
app.use('/api/competencias', competenciasRouter);
app.use('/api/eventos', eventosRouter);

/** 404 handler */
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

/** Global error handler */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============= Start Server =============

const startServer = async () => {
  // Test database connection on startup
  const dbOk = await testConnection();
  if (!dbOk) {
    console.warn('⚠️  Starting server without database connection');
  }

  app.listen(PORT, () => {
    console.log(`🏌️ Golf Tournament API running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   CORS origins: ${allowedOrigins.join(', ')}`);
  });
};

startServer();
