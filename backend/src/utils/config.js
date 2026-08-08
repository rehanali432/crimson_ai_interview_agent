import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // LLM (OpenRouter)
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    model: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b',
  },

  // Embeddings
  embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',

  // Interview settings
  interview: {
    minQuestions: 8,
    maxQuestions: 12,
    minCurriculumDays: 4,
    defaultDifficulty: 3,
  },
};

// Validate required config
const required = ['databaseUrl', 'openrouter.apiKey'];
for (const key of required) {
  const value = key.split('.').reduce((obj, k) => obj?.[k], config);
  if (!value) {
    console.error(`❌ Missing required config: ${key}`);
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }
}

export default config;
