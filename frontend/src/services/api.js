import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout for LLM responses (RAG pipeline can take time)
});

/**
 * Fetch all available candidates.
 */
export async function getCandidates() {
  const { data } = await api.get('/candidates');
  return data.candidates;
}

/**
 * Fetch a single candidate by ID.
 */
export async function getCandidate(candidateId) {
  const { data } = await api.get(`/candidates/${candidateId}`);
  return data;
}

/**
 * Start a new interview session.
 */
export async function startInterview(sessionId, candidate) {
  const { data } = await api.post('/interview', { sessionId, candidate });
  return data;
}

/**
 * Send a message in an active interview session.
 */
export async function sendMessage(sessionId, message) {
  const { data } = await api.post('/interview', { sessionId, message });
  return data;
}

/**
 * Health check.
 */
export async function checkHealth() {
  const { data } = await api.get('/health');
  return data;
}

export default api;
