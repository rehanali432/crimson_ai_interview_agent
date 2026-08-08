import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  BookOpen,
  ChevronDown,
  Info,
  Users,
  Wrench,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCandidates } from '../services/api';
import CandidateDetailModal from '../components/CandidateDetailModal';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

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

        if (data?.length) {
          setSelectedCandidate(data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch candidates:', err);
        setError('Backend server not connected. Please ensure backend server is running on port 3001.');
      } finally {
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

  const toolsCovered = selectedCandidate?.breakdown?.toolsCovered || [];
  const visibleTools = toolsCovered.slice(0, 8);

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 px-5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 sm:h-20">
          <a href="#top" className="group flex min-w-0 items-center gap-3" aria-label="Crimson AI home">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black text-white transition-transform duration-300 group-hover:-rotate-6">
              <img width="24" height="24" src="https://img.icons8.com/fluency-systems-regular/48/circled-c.png" alt="circled-c" className="invert filter brightness-200" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold tracking-tight sm:text-lg">Crimson AI</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">Interview studio</span>
            </span>
          </a>

          <a
            href="#candidates"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white bg-white px-4 py-2.5 text-xs font-semibold text-black transition duration-200 hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-5"
          >
            Start interview
            <ArrowRight size={15} />
          </a>
        </div>
      </header>

      <main id="top">
        <section className="relative isolate px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28 lg:pt-36">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
            <div className="absolute -right-32 top-8 size-[29rem] rounded-full border border-white/10 sm:right-4" />
            <div className="absolute -left-56 top-44 size-96 rounded-full border border-white/[0.07]" />
          </div>

          <div className="mx-auto max-w-5xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65"
            >
              <span className="size-1.5 rounded-full bg-white" />
              Personalised technical interviews
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mx-auto max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl lg:text-8xl"
            >
              A better way to
              <br />
              run technical interviews.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/60 sm:mt-8 sm:text-lg"
            >
              Select a candidate profile, start a focused conversation, and receive a clear view of their technical strengths and next steps.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <a
                href="#candidates"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition duration-200 hover:scale-[1.02] hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
              >
                Choose a candidate
                <ArrowRight size={16} />
              </a>
              <span className="text-xs text-white/45">Designed for considered, one-to-one evaluation.</span>
            </motion.div>
          </div>
        </section>

        <section id="candidates" className="border-y border-white/10 bg-white/[0.03] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Candidate workspace</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Choose who you want to interview.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                Each profile brings its completed work, covered topics, and areas worth exploring into one calm interview space.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start xl:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.06 }}
                className="rounded-3xl border border-white/10 bg-black p-5 shadow-2xl shadow-black/40 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold">Select a profile</h3>
                    <p className="mt-1 text-xs leading-5 text-white/50">Choose a candidate to prepare their interview.</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-medium text-white/50">
                    {loading ? 'Loading' : `${candidates.length} profiles`}
                  </span>
                </div>

                <div className="relative mt-6">
                  <label htmlFor="candidate-picker" className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                    Candidate
                  </label>
                  <button
                    id="candidate-picker"
                    type="button"
                    onClick={() => setShowDropdown((isOpen) => !isOpen)}
                    disabled={loading}
                    aria-expanded={showDropdown}
                    aria-haspopup="listbox"
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-4 text-left transition duration-200 hover:border-white/35 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white text-xs font-bold text-black">
                        {selectedCandidate ? getInitials(selectedCandidate.name) : <Users size={17} />}
                      </span>
                      {selectedCandidate ? (
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{selectedCandidate.name}</span>
                          <span className="mt-0.5 block truncate text-xs text-white/50">
                            {selectedCandidate.jobRole} · {selectedCandidate.yearsExperience} years experience
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm text-white/50">{loading ? 'Loading profiles…' : 'No candidate available'}</span>
                      )}
                    </span>
                    <ChevronDown size={18} className={`shrink-0 text-white/55 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.16 }}
                        role="listbox"
                        aria-label="Candidate profiles"
                        className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-white/15 bg-black p-1.5 shadow-2xl shadow-black"
                      >
                        {candidates.map((candidate) => {
                          const isSelected = selectedCandidate?.id === candidate.id;

                          return (
                            <button
                              key={candidate.id}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => {
                                setSelectedCandidate(candidate);
                                setShowDropdown(false);
                              }}
                              className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left transition duration-150 ${
                                isSelected ? 'bg-white text-black' : 'text-white hover:bg-white/10'
                              }`}
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold">{candidate.name}</span>
                                <span className={`mt-0.5 block truncate text-xs ${isSelected ? 'text-black/60' : 'text-white/50'}`}>
                                  {candidate.jobRole} · {candidate.yearsExperience} years experience
                                </span>
                              </span>
                              <span className={`shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] ${isSelected ? 'text-black/55' : 'text-white/40'}`}>
                                {candidate.missionsCompleted || 0} completed
                              </span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {error && (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl border border-white/15 bg-white/[0.04] p-3 text-xs leading-5 text-white/65">
                    <Info size={15} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="text-xs leading-6 text-white/50">
                    The interview adapts to the selected profile while keeping the conversation focused and easy to follow.
                  </p>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {selectedCandidate ? (
                  <motion.article
                    key={selectedCandidate.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="overflow-hidden rounded-3xl border border-white/15 bg-black shadow-2xl shadow-black/40"
                  >
                    <div className="flex flex-col gap-6 border-b border-white/10 p-6 sm:p-8 md:flex-row md:items-start md:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-bold text-black sm:size-16 sm:text-xl">
                          {getInitials(selectedCandidate.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Selected candidate</p>
                          <h3 className="mt-2 truncate text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{selectedCandidate.name}</h3>
                          <p className="mt-1 text-sm text-white/55">
                            {selectedCandidate.jobRole} · {selectedCandidate.yearsExperience} years experience
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-xs font-semibold transition duration-200 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:w-auto"
                      >
                        <BookOpen size={15} />
                        View profile details
                      </button>
                    </div>

                    <div className="p-6 sm:p-8">
                      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                          ['Modules covered', selectedCandidate.breakdown?.totalModulesCovered || 0, '/ 8'],
                          ['Topics passed', selectedCandidate.breakdown?.totalTopicsPassed || 0, '/ 31'],
                          ['Objectives met', selectedCandidate.breakdown?.totalObjectivesAchieved || 0, ''],
                          ['Tools explored', selectedCandidate.breakdown?.totalToolsMastered || 0, ''],
                        ].map(([label, value, suffix]) => (
                          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</dt>
                            <dd className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                              {value}
                              {suffix && <span className="ml-1 text-sm font-medium text-white/40">{suffix}</span>}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      <div className="mt-8">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Tools and technologies</p>
                          {toolsCovered.length > visibleTools.length && (
                            <span className="text-xs text-white/45">+{toolsCovered.length - visibleTools.length} more</span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {visibleTools.length ? (
                            visibleTools.map((tool) => (
                              <span key={tool} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70">
                                <Wrench size={12} />
                                {tool}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-white/45">No tools recorded for this profile yet.</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-sm text-xs leading-5 text-white/50">Begin when you are ready. The interview will open in a dedicated workspace.</p>
                        <button
                          type="button"
                          onClick={handleStart}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-black transition duration-200 hover:scale-[1.015] hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                        >
                          Start interview
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-white/15 bg-black p-8 text-center"
                  >
                    <p className="max-w-xs text-sm leading-6 text-white/50">A selected candidate profile will appear here.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSelect={(candidate) => {
            setSelectedCandidate(candidate);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
