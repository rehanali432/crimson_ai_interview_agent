import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Award, Wrench, Layers, BookOpen, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function CandidateDetailModal({ candidate, isOpen, onClose, onSelect }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'modules' | 'topics' | 'tools'

  if (!isOpen || !candidate) return null;

  const breakdown = candidate.breakdown || {};
  const modules = breakdown.modules || [];
  const dailyTopics = breakdown.dailyTopics || [];
  const toolsCovered = breakdown.toolsCovered || [];
  const achievedObjectives = breakdown.achievedObjectives || [];

  const strengthColors = {
    strong: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    moderate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    weak: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto"
        >
          {/* Top Header Banner */}
          <div className="relative px-6 py-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-indigo-950/50">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white tracking-tight">{candidate.name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${strengthColors[candidate.overallStrength || 'moderate']}`}>
                    {candidate.overallStrength || 'moderate'} candidate
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {candidate.jobRole} · {candidate.yearsExperience} Years Exp · {candidate.education || 'CS Degree'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => {
                  onSelect(candidate);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-900/40 transition-all cursor-pointer"
              >
                Select Candidate
                <ArrowRight size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-800/80 bg-slate-900/50 border-b border-slate-800/80 text-center">
            <div className="p-4">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5 mb-1">
                <Layers size={14} className="text-indigo-400" />
                Modules Covered
              </div>
              <div className="text-xl font-bold text-white">
                {breakdown.totalModulesCovered || 0} <span className="text-xs font-normal text-slate-500">/ 8</span>
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5 mb-1">
                <BookOpen size={14} className="text-purple-400" />
                Topics Passed
              </div>
              <div className="text-xl font-bold text-white">
                {breakdown.totalTopicsPassed || 0} <span className="text-xs font-normal text-slate-500">/ 31</span>
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5 mb-1">
                <Sparkles size={14} className="text-cyan-400" />
                Objectives Met
              </div>
              <div className="text-xl font-bold text-white">
                {breakdown.totalObjectivesAchieved || 0}
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5 mb-1">
                <Wrench size={14} className="text-emerald-400" />
                Tools Mastered
              </div>
              <div className="text-xl font-bold text-white">
                {breakdown.totalToolsMastered || 0}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 px-6 bg-slate-950 gap-6">
            {[
              { id: 'overview', label: 'Program Overview', icon: <Award size={15} /> },
              { id: 'modules', label: 'Modules Breakdown', icon: <Layers size={15} /> },
              { id: 'topics', label: 'Daily Topics (31 Days)', icon: <BookOpen size={15} /> },
              { id: 'tools', label: 'Tools & Objectives', icon: <Wrench size={15} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Modal Tab Body */}
          <div className="p-6 max-h-[420px] overflow-y-auto custom-scrollbar">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Curriculum Mastered Tools & Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {toolsCovered.map((tool, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-indigo-300 flex items-center gap-1.5"
                      >
                        <Wrench size={12} className="text-indigo-400" />
                        {tool}
                      </span>
                    ))}
                    {toolsCovered.length === 0 && (
                      <span className="text-xs text-slate-500 italic">No tools recorded yet.</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
                      <ShieldCheck size={16} />
                      Strong Mission Highlights
                    </div>
                    <ul className="space-y-2">
                      {candidate.missions?.filter(m => m.passed && m.attempts === 1).slice(0, 4).map((m, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-center justify-between">
                          <span>Day {m.day}: {m.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">1st try</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
                      <AlertCircle size={16} />
                      Targeted Review Areas
                    </div>
                    <ul className="space-y-2">
                      {candidate.missions?.filter(m => !m.passed || m.skipped || m.attempts >= 3).slice(0, 4).map((m, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-center justify-between">
                          <span>Day {m.day}: {m.title}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${m.skipped ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {m.skipped ? 'skipped' : `${m.attempts} attempts`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* MODULES TAB */}
            {activeTab === 'modules' && (
              <div className="space-y-4">
                {modules.map((mod) => {
                  const pct = Math.round((mod.passedDays / mod.totalDays) * 100);
                  return (
                    <div key={mod.number} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                            M{mod.number}
                          </span>
                          <h4 className="text-sm font-semibold text-white">{mod.title}</h4>
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          {mod.passedDays} / {mod.totalDays} Days ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {mod.days.map((day) => (
                          <span
                            key={day.day}
                            className={`text-[10px] px-2 py-1 rounded-lg border font-mono ${
                              day.status === 'aced'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : day.status === 'passed'
                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                                : day.status === 'struggled'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                : day.status === 'skipped'
                                ? 'bg-slate-800 border-slate-700 text-slate-400 line-through'
                                : 'bg-slate-950 border-slate-800 text-slate-600'
                            }`}
                          >
                            D{day.day} {day.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TOPICS TAB */}
            {activeTab === 'topics' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {dailyTopics.map((topic) => (
                  <div
                    key={topic.day}
                    className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-medium text-white">
                        <span className="text-indigo-400 font-mono">Day {topic.day}:</span> {topic.title}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {topic.tools.join(', ') || topic.type}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${
                        topic.status === 'aced'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : topic.status === 'passed'
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                          : topic.status === 'struggled'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : topic.status === 'skipped'
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-slate-950 border-slate-800 text-slate-600'
                      }`}
                    >
                      {topic.status === 'aced' ? '1st Try' : topic.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TOOLS & OBJECTIVES TAB */}
            {activeTab === 'tools' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Learning Objectives Achieved ({achievedObjectives.length})
                  </h4>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                    {achievedObjectives.map((obj, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-2 text-xs">
                        <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-indigo-300">Day {obj.day} ({obj.topic}):</span>{' '}
                          <span className="text-slate-300">{obj.objective}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
