import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import OpenAI from 'openai';
import { sql } from '../db/index.js';
import config from '../utils/config.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load curriculum data at startup
const curriculumPath = resolve(__dirname, '../data/curriculum.json');
const curriculumData = JSON.parse(readFileSync(curriculumPath, 'utf-8'));

// OpenAI client for embeddings (via OpenRouter)
const openai = new OpenAI({
  apiKey: config.openrouter.apiKey,
  baseURL: config.openrouter.baseUrl,
});

/**
 * Curriculum Retriever — embeds curriculum into pgvector
 * and provides semantic search over curriculum content.
 *
 * This is the core vector DB component required by the hackathon.
 *
 * Pipeline:
 * 1. Chunk curriculum into meaningful pieces (objectives, tools, overviews)
 * 2. Generate embeddings via text-embedding-3-small
 * 3. Store in pgvector (curriculum_embeddings table)
 * 4. Retrieve relevant chunks via cosine similarity search
 */

/**
 * Get the full curriculum day data by day number.
 * Falls back to in-memory lookup (always available).
 */
export function getCurriculumDay(dayNumber) {
  return curriculumData.days.find(d => d.day === dayNumber) || null;
}

/**
 * Get the module that a day belongs to.
 */
export function getModuleForDay(dayNumber) {
  for (const mod of curriculumData.modules) {
    if (dayNumber >= mod.days[0] && dayNumber <= mod.days[1]) {
      return { number: mod.n, title: mod.title };
    }
  }
  return null;
}

/**
 * Get all curriculum days.
 */
export function getAllDays() {
  return curriculumData.days;
}

/**
 * Generate an embedding for a text string using OpenAI API.
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: config.embeddingModel,
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    logger.error('Failed to generate embedding', { error: error.message, textLength: text.length });
    throw error;
  }
}

/**
 * Chunk the curriculum into embeddable pieces.
 * Each chunk is a meaningful unit of curriculum content.
 */
function chunkCurriculum() {
  const chunks = [];

  for (const day of curriculumData.days) {
    const module = getModuleForDay(day.day);

    // Chunk 1: Day overview
    const overviewText = `Day ${day.day}: ${day.title}. Type: ${day.type}. Module: ${module?.title || 'Unknown'}. Tools: ${day.tools.join(', ')}.`;
    chunks.push({
      day: day.day,
      title: day.title,
      chunkType: 'overview',
      content: overviewText,
      moduleNumber: module?.number,
      moduleName: module?.title,
      dayType: day.type,
    });

    // Chunk 2: Each learning objective as a separate chunk
    for (let i = 0; i < day.objectives.length; i++) {
      const objectiveText = `Day ${day.day} - ${day.title} - Objective ${i + 1}: ${day.objectives[i]}`;
      chunks.push({
        day: day.day,
        title: day.title,
        chunkType: 'objective',
        content: objectiveText,
        moduleNumber: module?.number,
        moduleName: module?.title,
        dayType: day.type,
      });
    }

    // Chunk 3: Tools context
    if (day.tools.length > 0) {
      const toolsText = `Day ${day.day} - ${day.title} uses these tools and technologies: ${day.tools.join(', ')}. This is a ${day.type} day in the ${module?.title || 'Unknown'} module.`;
      chunks.push({
        day: day.day,
        title: day.title,
        chunkType: 'tool',
        content: toolsText,
        moduleNumber: module?.number,
        moduleName: module?.title,
        dayType: day.type,
      });
    }
  }

  logger.info('Curriculum chunked', { totalChunks: chunks.length });
  return chunks;
}

/**
 * Seed the curriculum embeddings table.
 * Generates embeddings for all curriculum chunks and stores them in pgvector.
 * Skips if already seeded (idempotent).
 */
export async function seedCurriculumEmbeddings() {
  // Check if already seeded
  const existing = await sql`SELECT COUNT(*) as count FROM curriculum_embeddings`;
  const count = parseInt(existing[0].count);

  if (count > 0) {
    logger.info('Curriculum embeddings already seeded', { existingCount: count });
    return count;
  }

  logger.info('Seeding curriculum embeddings into pgvector...');

  const chunks = chunkCurriculum();
  let seeded = 0;
  const batchSize = 10;

  // Process in batches to avoid rate limits
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    // Generate embeddings for the batch
    const texts = batch.map(c => c.content);
    try {
      const response = await openai.embeddings.create({
        model: config.embeddingModel,
        input: texts,
      });

      // Insert each chunk with its embedding
      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        const embedding = response.data[j].embedding;
        const embeddingStr = `[${embedding.join(',')}]`;

        await sql`
          INSERT INTO curriculum_embeddings (day, title, chunk_type, content, module_number, module_name, day_type, embedding, metadata)
          VALUES (
            ${chunk.day},
            ${chunk.title},
            ${chunk.chunkType},
            ${chunk.content},
            ${chunk.moduleNumber},
            ${chunk.moduleName},
            ${chunk.dayType},
            ${embeddingStr}::vector,
            ${JSON.stringify({})}::jsonb
          )
        `;
        seeded++;
      }

      logger.debug('Batch embedded', { batch: Math.floor(i / batchSize) + 1, seeded });
    } catch (error) {
      logger.error('Failed to embed batch', { error: error.message, batchStart: i });
      throw error;
    }
  }

  logger.info('Curriculum embeddings seeded successfully ✅', { totalSeeded: seeded });
  return seeded;
}

/**
 * Retrieve relevant curriculum chunks using pgvector cosine similarity.
 * This is the core RAG retrieval function.
 *
 * @param {string} query - The search query (e.g., "vector databases and similarity search")
 * @param {number} limit - Number of results to return
 * @param {object} filters - Optional filters (dayNumbers, chunkTypes, dayTypes)
 * @returns {Array} Ranked curriculum chunks with similarity scores
 */
export async function retrieveCurriculumChunks(query, limit = 5, filters = {}) {
  logger.debug('Retrieving curriculum chunks', { query, limit, filters });

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  let results;

  if (filters.dayNumbers && filters.dayNumbers.length > 0) {
    // Filter by specific day numbers
    results = await sql`
      SELECT
        id, day, title, chunk_type, content, module_number, module_name, day_type,
        1 - (embedding <=> ${embeddingStr}::vector) as similarity
      FROM curriculum_embeddings
      WHERE day = ANY(${filters.dayNumbers}::int[])
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    `;
  } else if (filters.chunkTypes && filters.chunkTypes.length > 0) {
    // Filter by chunk type
    results = await sql`
      SELECT
        id, day, title, chunk_type, content, module_number, module_name, day_type,
        1 - (embedding <=> ${embeddingStr}::vector) as similarity
      FROM curriculum_embeddings
      WHERE chunk_type = ANY(${filters.chunkTypes}::text[])
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    `;
  } else {
    // No filters — search all
    results = await sql`
      SELECT
        id, day, title, chunk_type, content, module_number, module_name, day_type,
        1 - (embedding <=> ${embeddingStr}::vector) as similarity
      FROM curriculum_embeddings
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    `;
  }

  const chunks = results.map(row => ({
    day: row.day,
    title: row.title,
    chunkType: row.chunk_type,
    content: row.content,
    moduleNumber: row.module_number,
    moduleName: row.module_name,
    dayType: row.day_type,
    similarity: parseFloat(row.similarity),
  }));

  logger.debug('Curriculum chunks retrieved', {
    query: query.substring(0, 50),
    results: chunks.length,
    topSimilarity: chunks[0]?.similarity?.toFixed(4),
  });

  return chunks;
}

/**
 * Retrieve curriculum context for a specific day.
 * Combines pgvector results with direct JSON lookup for complete context.
 */
export async function getFullDayContext(dayNumber) {
  const day = getCurriculumDay(dayNumber);
  if (!day) return null;

  const module = getModuleForDay(dayNumber);

  return {
    day: day.day,
    title: day.title,
    type: day.type,
    tools: day.tools,
    objectives: day.objectives,
    module: module,
  };
}
