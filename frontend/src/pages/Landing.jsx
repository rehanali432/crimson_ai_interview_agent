import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  MessageSquare,
  BarChart3,
  Users,
  ChevronDown,
  Sparkles,
  Database,
  Layers,
  Wrench,
  CheckCircle2,
  BookOpen,
  Info,
  ShieldCheck,
  Cpu,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCandidates } from '../services/api';
import CandidateDetailModal from '../components/CandidateDetailModal';

export default function Landing() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCandidates();
        setCandidates(data || []);
        if (data && data.length > 0) {
          setSelectedCandidate(data[0]); // Default select candidate 1
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch candidates:', err);
        setError('Backend server not connected. Please ensure backend server is running on port 3001.');
        setLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  function handleStart() {
    if (!selectedCandidate) return;
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    navigate('/interview', { state: { sessionId, candidateId: selectedCandidate.id } });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Subtle Background Lighting Orbs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ─── 1. NAVBAR ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-950/50">
              <Brain size={22} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight block">Crimson AI</span>
              <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase block -mt-1">
                Interview Agent
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
            <a href="#hero" className="hover:text-white transition-colors">Overview</a>
            <a href="#candidates" className="hover:text-white transition-colors">Candidate Hub</a>
            <a href="#features" className="hover:text-white transition-colors">RAG System</a>
            <a href="#curriculum" className="hover:text-white transition-colors">Curriculum</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </nav>

          {/* Hackathon Badge & CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Sparkles size={14} className="text-indigo-400" />
              <span>ABTalks Hackathon</span>
            </div>
            <a
              href="#candidates"
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Start Interview
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── 2. HERO SECTION ─────────────────────────────────────────────────── */}
        <section id="hero" className="relative pt-20 pb-16 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-md"
            >
              <Cpu size={14} className="text-indigo-400 animate-pulse" />
              <span>Curriculum-Aware RAG Interviewer · 31 Days Cohort</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.15] mb-6"
            >
              The Intelligent <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Technical Interviewer
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Not a generic quiz bot. Crimson AI analyzes candidate mission history, retrieves pgvector curriculum embeddings, and conducts adaptive, real-time technical interviews.
            </motion.p>

            {/* Stats Counter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16 p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md"
            >
              <div className="p-3">
                <div className="text-2xl font-bold text-white font-mono">217</div>
                <div className="text-[11px] text-slate-400">pgvector Chunks</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-bold text-indigo-400 font-mono">20</div>
                <div className="text-[11px] text-slate-400">Candidate Profiles</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-bold text-purple-400 font-mono">31 Days</div>
                <div className="text-[11px] text-slate-400">AI Curriculum</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-bold text-emerald-400 font-mono">Adaptable</div>
                <div className="text-[11px] text-slate-400">LLM Question Engine</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── 3. CANDIDATE SELECTION & PROFILE BREAKDOWN SECTION ────────────── */}
        <section id="candidates" className="py-16 px-6 bg-slate-900/40 border-y border-slate-800/80 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block mb-2">Candidate Selection Hub</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Select Candidate to Interview</h2>
              <p className="text-sm text-slate-400 mt-2">
                Pick a candidate from the 20 cohort members. Crimson AI reads their mission attempts, covered tools, and skill gaps to personalize the interview.
              </p>
            </div>

            {/* Candidate Selector Bar */}
            <div className="max-w-2xl mx-auto mb-8 relative">
              <label className="block text-xs font-medium text-slate-300 mb-2">Select Cohort Candidate:</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  disabled={loading}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-900 border border-slate-700/80 hover:border-indigo-500/50 flex items-center justify-between cursor-pointer text-left shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-indigo-400" />
                    {selectedCandidate ? (
                      <div>
                        <div className="text-sm font-bold text-white">{selectedCandidate.name}</div>
                        <div className="text-xs text-slate-400">{selectedCandidate.jobRole} · {selectedCandidate.yearsExperience}y exp</div>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">
                        {loading ? 'Loading candidate database...' : 'Select a candidate...'}
                      </span>
                    )}
                  </div>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Options */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden z-50 max-h-80 overflow-y-auto shadow-2xl divide-y divide-slate-800"
                    >
                      {candidates.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCandidate(c);
                            setShowDropdown(false);
                          }}
                          className={`w-full px-5 py-3.5 flex items-center justify-between hover:bg-indigo-950/40 transition-colors text-left cursor-pointer ${
                            selectedCandidate?.id === c.id ? 'bg-indigo-900/30' : ''
                          }`}
                        >
                          <div>
                            <div className="text-sm font-semibold text-white">{c.name}</div>
                            <div className="text-xs text-slate-400">{c.jobRole} · {c.yearsExperience}y exp · {c.missionsCompleted} missions</div>
                          </div>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${
                            c.overallStrength === 'strong'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {c.overallStrength || 'moderate'}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <Info size={14} />
                  {error}
                </div>
              )}
            </div>

            {/* Selected Candidate Detailed Breakdown Card */}
            {selectedCandidate && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-lg">
                      {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedCandidate.name}</h3>
                      <p className="text-xs text-slate-400">{selectedCandidate.jobRole} · {selectedCandidate.yearsExperience} Years Experience</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <BookOpen size={14} />
                    View Detailed Breakdown
                  </button>
                </div>

                {/* Candidate Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Modules Covered</div>
                    <div className="text-lg font-bold text-white">
                      {selectedCandidate.breakdown?.totalModulesCovered || 0} <span className="text-xs text-slate-500">/ 8</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Daily Topics</div>
                    <div className="text-lg font-bold text-white">
                      {selectedCandidate.breakdown?.totalTopicsPassed || 0} <span className="text-xs text-slate-500">/ 31</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Objectives Met</div>
                    <div className="text-lg font-bold text-indigo-400">
                      {selectedCandidate.breakdown?.totalObjectivesAchieved || 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Tools Mastered</div>
                    <div className="text-lg font-bold text-purple-400">
                      {selectedCandidate.breakdown?.totalToolsMastered || 0}
                    </div>
                  </div>
                </div>

                {/* Covered Tools Chips */}
                <div className="mb-8">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Covered Tools & Technologies:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(selectedCandidate.breakdown?.toolsCovered || []).slice(0, 8).map((tool, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-indigo-950/50 border border-indigo-500/20 text-indigo-300 text-xs font-medium flex items-center gap-1.5">
                        <Wrench size={12} className="text-indigo-400" />
                        {tool}
                      </span>
                    ))}
                    {(selectedCandidate.breakdown?.toolsCovered || []).length > 8 && (
                      <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-400 text-xs font-medium">
                        +{(selectedCandidate.breakdown?.toolsCovered || []).length - 8} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Start Interview CTA Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleStart}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-indigo-950/60 transition-all cursor-pointer"
                  >
                    Start Technical Interview for {selectedCandidate.name}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* ─── 4. FEATURES & RAG ENGINE SECTION ──────────────────────────────── */}
        <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block mb-2">Engine Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Powered by Curriculum RAG</h2>
            <p className="text-sm text-slate-400 mt-2">
              Unlike generic interview bots, Crimson AI runs vector similarity search over the 31-day curriculum to frame contextual questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                <Database size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">pgvector Retrieval</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                217 curriculum chunks stored in Neon PostgreSQL. Retrieves exact objectives, code concepts, and tools using cosine similarity embeddings.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                <Brain size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Mission Analysis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analyzes candidate passed, aced, skipped, and struggled missions. Selects topics with strategic intent (probe fundamentals vs probe depth).
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Structured Assessment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates candidate answers in real-time, adjusts difficulty dynamically, and generates confidence scores with actionable feedback.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 5. CURRICULUM OVERVIEW SECTION ─────────────────────────────────── */}
        <section id="curriculum" className="py-16 px-6 bg-slate-900/30 border-t border-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block mb-2">31-Day AI Cohort</span>
              <h2 className="text-3xl font-bold text-white tracking-tight">Curriculum Modules Covered</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Environment & Tooling', days: 'Days 1–3', tools: 'VS Code, Python, Virtualenv' },
                { title: 'Data Foundations', days: 'Days 4–6', tools: 'Pandas, NumPy, Clean Data' },
                { title: 'Embeddings & Vector DBs', days: 'Days 7–10', tools: 'ChromaDB, Pinecone, Cosine' },
                { title: 'LLM Core & Prompting', days: 'Days 11–15', tools: 'OpenAI API, Function Calling' },
                { title: 'Chatbot Build', days: 'Days 16–20', tools: 'FastAPI, Express, Streaming' },
                { title: 'Agentic AI & MCP', days: 'Days 21–24', tools: 'LangChain, MCP Server' },
                { title: 'Security & Deployment', days: 'Days 25–28', tools: 'Docker, Kubernetes, Observability' },
                { title: 'Production Capstone', days: 'Days 29–31', tools: 'Final RAG System Demo' },
              ].map((mod, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-[10px] font-mono font-semibold text-indigo-400 mb-1">Module {i + 1} · {mod.days}</div>
                  <h4 className="text-sm font-bold text-white mb-2">{mod.title}</h4>
                  <p className="text-[11px] text-slate-400">{mod.tools}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 6. ABOUT SECTION ───────────────────────────────────────────────── */}
        <section id="about" className="py-20 px-6 max-w-4xl mx-auto text-center">
          <div className="p-10 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Built for ABTalks Vibe Coding Hackathon</h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto mb-6">
              "The objective is NOT to build an interview. The objective is to build an intelligent interviewer."
              Crimson AI adapts to user performance, probes weak areas, and delivers staff-engineer level evaluation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['React', 'Vite', 'Tailwind v4', 'Express', 'Drizzle ORM', 'Neon pgvector', 'OpenRouter API'].map((tech, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ─── 7. FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-indigo-400" />
            <span className="font-bold text-slate-300">Crimson AI Interview Agent</span>
          </div>
          <div>ABTalks Vibe Coding Hackathon 2026</div>
        </div>
      </footer>

      {/* Candidate Detail Breakdown Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSelect={(c) => {
            setSelectedCandidate(c);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
