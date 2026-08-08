import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowRight, Home, Brain, Target, TrendingUp, Sparkles, Award } from 'lucide-react';

export default function Feedback() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const feedback = state?.feedback;

  if (!feedback) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">No Feedback Session Found</h1>
        <p className="text-slate-400 text-sm mb-6 max-w-md">Could not locate active feedback data. Please start a new interview session.</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-white text-slate-950 font-bold rounded-2xl cursor-pointer">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const confidencePercentage = Math.round((feedback.confidenceScore || 0.5) * 100);

  let scoreColor = 'text-emerald-400';
  let scoreBg = 'bg-emerald-500/10 border-emerald-500/30';
  if (confidencePercentage < 50) {
    scoreColor = 'text-rose-400';
    scoreBg = 'bg-rose-500/10 border-rose-500/30';
  } else if (confidencePercentage < 75) {
    scoreColor = 'text-amber-400';
    scoreBg = 'bg-amber-500/10 border-amber-500/30';
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 border-b border-slate-800/80 pb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Award size={14} className="text-indigo-400" />
              Interview Evaluation Completed
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Assessment Report
            </h1>
            <p className="text-sm text-slate-400 max-w-xl mt-2 leading-relaxed">
              {feedback.summary}
            </p>
          </div>

          {/* Confidence Score Badge */}
          <div className={`flex flex-col items-center justify-center min-w-[150px] p-6 rounded-3xl border backdrop-blur-md shadow-xl ${scoreBg}`}>
            <span className="text-[11px] text-slate-300 uppercase tracking-widest font-semibold mb-1">Confidence</span>
            <span className={`text-5xl font-extrabold font-mono ${scoreColor}`}>
              {confidencePercentage}%
            </span>
          </div>
        </motion.div>

        {/* Grid: Strengths & Growth Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          {/* Strengths */}
          {(() => {
            const strengthsList = feedback.strengths || [];
            const isInvalid = strengthsList.length === 0 || strengthsList.some(s => s.toLowerCase().includes('unable') || s.toLowerCase().includes('zero') || s.toLowerCase().includes('no valid'));

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
                    isInvalid ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    {isInvalid ? <AlertCircle size={20} /> : <Target size={20} />}
                  </div>
                  <h2 className="text-lg font-bold text-white">Demonstrated Strengths</h2>
                </div>

                {isInvalid ? (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed flex items-start gap-2.5">
                    <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>No valid technical answers were provided during this interview session. Zero technical strengths demonstrated.</span>
                  </div>
                ) : (
                  <ul className="space-y-3.5">
                    {strengthsList.map((strength, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                        <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            );
          })()}

          {/* Growth Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">Knowledge Gaps</h2>
            </div>
            <ul className="space-y-3.5">
              {(feedback.gaps || []).map((gap, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                  <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                  <span>{gap}</span>
                </li>
              ))}
              {(feedback.gaps || []).length === 0 && (
                <li className="text-xs text-slate-500 italic">No significant knowledge gaps detected.</li>
              )}
            </ul>
          </motion.div>
        </div>

        {/* Recommended Action Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md mb-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Recommended Action Plan</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(feedback.next || []).map((step, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                <ArrowRight size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-200 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>

          {feedback.daysToRevisit && feedback.daysToRevisit.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Brain size={14} className="text-purple-400" />
                Curriculum Days Recommended for Revision
              </h3>
              <div className="flex flex-wrap gap-2">
                {feedback.daysToRevisit.map((day) => (
                  <span key={day} className="px-3 py-1.5 text-xs font-mono rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
                    Day {day} Revision
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Link
            to="/"
            className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-xl cursor-pointer transition-all"
          >
            <Home size={18} />
            Return to Dashboard
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
