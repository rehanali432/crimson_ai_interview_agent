import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Layers,
  Wrench,
  X,
} from 'lucide-react';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function formatStatus(status) {
  if (!status) return 'Not started';
  if (status === 'aced') return 'First try';
  return status.replace(/_/g, ' ');
}

export default function CandidateDetailModal({ candidate, isOpen, onClose, onSelect }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !candidate) return null;

  const breakdown = candidate.breakdown || {};
  const modules = breakdown.modules || [];
  const dailyTopics = breakdown.dailyTopics || [];
  const toolsCovered = breakdown.toolsCovered || [];
  const achievedObjectives = breakdown.achievedObjectives || [];
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Award },
    { id: 'modules', label: 'Modules', icon: Layers },
    { id: 'topics', label: 'Topics', icon: BookOpen },
    { id: 'tools', label: 'Tools & objectives', icon: Wrench },
  ];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-detail-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 18 }}
          transition={{ duration: 0.22 }}
          className="my-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-black shadow-2xl shadow-black"
        >
          <header className="flex flex-col gap-5 border-b border-white/10 p-5 sm:p-7 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-bold text-black sm:size-16 sm:text-xl">
                {getInitials(candidate.name)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="candidate-detail-title" className="truncate text-xl font-semibold tracking-[-0.035em] sm:text-2xl">
                    {candidate.name}
                  </h2>
                  <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/50">
                    {candidate.overallStrength || 'profile'}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-white/55 sm:text-sm">
                  {candidate.jobRole} · {candidate.yearsExperience} years experience · {candidate.education || 'Technical profile'}
                </p>
              </div>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  onSelect(candidate);
                  onClose();
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-semibold text-black transition duration-200 hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex-none"
              >
                Use this profile
                <ArrowRight size={15} />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close candidate details"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/65 transition duration-200 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <dl className="grid grid-cols-2 divide-x divide-y divide-white/10 border-b border-white/10 bg-white/[0.03] sm:grid-cols-4 sm:divide-y-0">
            {[
              ['Modules covered', breakdown.totalModulesCovered || 0, '/ 8'],
              ['Topics passed', breakdown.totalTopicsPassed || 0, '/ 31'],
              ['Objectives met', breakdown.totalObjectivesAchieved || 0, ''],
              ['Tools explored', breakdown.totalToolsMastered || 0, ''],
            ].map(([label, value, suffix]) => (
              <div key={label} className="p-4 text-center sm:p-5">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</dt>
                <dd className="mt-2 text-xl font-semibold tracking-[-0.035em] sm:text-2xl">
                  {value}
                  {suffix && <span className="ml-1 text-xs font-medium text-white/40">{suffix}</span>}
                </dd>
              </div>
            ))}
          </dl>

          <nav className="flex gap-2 overflow-x-auto border-b border-white/10 px-4 py-3 sm:px-6" aria-label="Candidate detail sections">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    isActive ? 'bg-white text-black' : 'text-white/55 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="max-h-[min(56vh,32rem)] overflow-y-auto p-5 sm:p-6">
            {activeTab === 'overview' && (
              <div className="space-y-7">
                <section>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Tools and stack</h3>
                    <span className="text-xs text-white/40">{toolsCovered.length} recorded</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {toolsCovered.length ? (
                      toolsCovered.map((tool) => (
                        <span key={tool} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70">
                          <Wrench size={12} />
                          {tool}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-white/45">No tools recorded yet.</p>
                    )}
                  </div>
                </section>

                <div className="grid gap-4 md:grid-cols-2">
                  <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <CheckCircle2 size={16} />
                      Strong work
                    </div>
                    <ul className="mt-4 space-y-3">
                      {candidate.missions?.filter((mission) => mission.passed && mission.attempts === 1).slice(0, 4).map((mission) => (
                        <li key={`${mission.day}-${mission.title}`} className="flex items-start justify-between gap-3 text-xs leading-5 text-white/65">
                          <span>Day {mission.day}: {mission.title}</span>
                          <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-white/40">First try</span>
                        </li>
                      ))}
                      {!candidate.missions?.some((mission) => mission.passed && mission.attempts === 1) && (
                        <li className="text-xs text-white/45">No first-attempt completions recorded.</li>
                      )}
                    </ul>
                  </section>

                  <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <AlertCircle size={16} />
                      Areas to explore
                    </div>
                    <ul className="mt-4 space-y-3">
                      {candidate.missions?.filter((mission) => !mission.passed || mission.skipped || mission.attempts >= 3).slice(0, 4).map((mission) => (
                        <li key={`${mission.day}-${mission.title}`} className="flex items-start justify-between gap-3 text-xs leading-5 text-white/65">
                          <span>Day {mission.day}: {mission.title}</span>
                          <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-white/40">
                            {mission.skipped ? 'Skipped' : `${mission.attempts} attempts`}
                          </span>
                        </li>
                      ))}
                      {!candidate.missions?.some((mission) => !mission.passed || mission.skipped || mission.attempts >= 3) && (
                        <li className="text-xs text-white/45">No targeted review areas recorded.</li>
                      )}
                    </ul>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'modules' && (
              <div className="space-y-3">
                {modules.length ? modules.map((module) => {
                  const percent = module.totalDays ? Math.round((module.passedDays / module.totalDays) * 100) : 0;

                  return (
                    <section key={module.number} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-lg border border-white/15 text-xs font-semibold">{module.number}</span>
                          <div>
                            <h3 className="text-sm font-semibold">{module.title}</h3>
                            <p className="mt-0.5 text-xs text-white/45">{module.passedDays} of {module.totalDays} days completed</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-white/55">{percent}%</span>
                      </div>
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {module.days?.map((day) => (
                          <span key={day.day} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/60">
                            D{day.day} · {formatStatus(day.status)}
                          </span>
                        ))}
                      </div>
                    </section>
                  );
                }) : (
                  <p className="py-8 text-center text-sm text-white/45">No module details recorded yet.</p>
                )}
              </div>
            )}

            {activeTab === 'topics' && (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {dailyTopics.length ? dailyTopics.map((topic) => (
                  <div key={topic.day} className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold">Day {topic.day}: {topic.title}</p>
                      <p className="mt-1 truncate text-[11px] text-white/45">{topic.tools?.join(', ') || topic.type}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.1em] text-white/45">{formatStatus(topic.status)}</span>
                  </div>
                )) : (
                  <p className="col-span-full py-8 text-center text-sm text-white/45">No daily topics recorded yet.</p>
                )}
              </div>
            )}

            {activeTab === 'tools' && (
              <section>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Objectives achieved</h3>
                  <span className="text-xs text-white/40">{achievedObjectives.length} recorded</span>
                </div>
                <div className="mt-4 space-y-2">
                  {achievedObjectives.length ? achievedObjectives.map((objective, index) => (
                    <div key={`${objective.day}-${objective.objective}-${index}`} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs leading-5">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                      <p>
                        <span className="font-semibold">Day {objective.day} · {objective.topic}</span>
                        <span className="text-white/60"> — {objective.objective}</span>
                      </p>
                    </div>
                  )) : (
                    <p className="py-8 text-center text-sm text-white/45">No objectives recorded yet.</p>
                  )}
                </div>
              </section>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
