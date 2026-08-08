import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import config from './utils/config.js';
import logger from './utils/logger.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import interviewRoutes from './routes/interviewRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import { testConnection } from './db/index.js';
import { seedCurriculumEmbeddings } from './rag/curriculumRetriever.js';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: dbConnected ? 'healthy' : 'degraded',
    service: 'crimson-ai-interview-agent',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    environment: config.nodeEnv,
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api', interviewRoutes);
app.use('/api', candidateRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(config.port, async () => {
  logger.info(`🚀 Server running on port ${config.port}`, {
    port: config.port,
    env: config.nodeEnv,
    model: config.openrouter.model,
  });

  // Seed curriculum embeddings into pgvector (async, non-blocking)
  try {
    const count = await seedCurriculumEmbeddings();
    logger.info(`📚 Curriculum embeddings ready`, { count });
  } catch (error) {
    logger.error('Failed to seed curriculum embeddings', { error: error.message });
    logger.warn('Server will continue but RAG retrieval may not work');
  }
});

export default app;
