import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowRight, Home, Brain, Target, TrendingUp, Award } from 'lucide-react';

export default function Feedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const feedback = state?.feedback;

  if (!feedback) {
    return (
      <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 sm:py-12">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center text-center sm:min-h-[calc(100vh-6rem)]">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-950 text-white">
            <AlertCircle size={26} aria-hidden="true" />
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Interview report</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">No feedback session found</h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
            Could not locate active feedback data. Please start a new interview session.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Return home
          </button>
        </div>
      </main>
    );
  }

  const confidencePercentage = Math.round((feedback.confidenceScore ?? 0.5) * 100);
  const confidenceLabel = confidencePercentage >= 75
    ? 'Strong response quality'
    : confidencePercentage >= 50
      ? 'Developing response quality'
      : 'Focused practice recommended';
  const strengthsList = feedback.strengths || [];
  const isInvalid = strengthsList.length === 0 || strengthsList.some((strength) => (
    strength.toLowerCase().includes('unable')
    || strength.toLowerCase().includes('zero')
    || strength.toLowerCase().includes('no valid')
  ));

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 items-start gap-8 border-b border-zinc-800 pb-8 sm:pb-10 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12"
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
              <Award size={14} aria-hidden="true" />
              Interview complete
            </div>
            <h1 className="mt-5 font-heading text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Assessment report
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
              {feedback.summary}
            </p>
          </div>

          <div className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Confidence score</p>
            <p className="mt-3 font-heading text-5xl font-semibold tracking-[-0.06em] text-white">
              {confidencePercentage}<span className="ml-1 text-2xl text-zinc-500">%</span>
            </p>
            <div className="mt-5 h-px w-full bg-zinc-800" />
            <p className="mt-4 text-sm leading-6 text-zinc-400">{confidenceLabel}</p>
          </div>
        </motion.header>

        <section className="mt-8 grid grid-cols-1 gap-5 lg:mt-10 lg:grid-cols-2 lg:gap-6" aria-label="Assessment details">
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-black text-white">
                {isInvalid ? <AlertCircle size={19} aria-hidden="true" /> : <Target size={19} aria-hidden="true" />}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">What went well</p>
                <h2 className="mt-1 font-heading text-xl font-semibold tracking-tight text-white">Demonstrated strengths</h2>
              </div>
            </div>

            {isInvalid ? (
              <div className="mt-7 rounded-xl border border-zinc-700 bg-black p-4 text-sm leading-6 text-zinc-300">
                No valid technical answers were provided during this interview session. No technical strengths could be identified.
              </div>
            ) : (
              <ul className="mt-7 space-y-5">
                {strengthsList.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm leading-6 text-zinc-300 sm:text-[15px]">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-white" aria-hidden="true" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-black text-white">
                <AlertCircle size={19} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Where to focus</p>
                <h2 className="mt-1 font-heading text-xl font-semibold tracking-tight text-white">Knowledge gaps</h2>
              </div>
            </div>

            {(feedback.gaps || []).length > 0 ? (
              <ul className="mt-7 space-y-5">
                {feedback.gaps.map((gap, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm leading-6 text-zinc-300 sm:text-[15px]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white" aria-hidden="true" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-7 text-sm leading-6 text-zinc-400">No significant knowledge gaps were detected.</p>
            )}
          </motion.article>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:mt-6 sm:p-8"
          aria-labelledby="action-plan-title"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-black text-white">
              <TrendingUp size={19} aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Next steps</p>
              <h2 id="action-plan-title" className="mt-1 font-heading text-xl font-semibold tracking-tight text-white">Recommended action plan</h2>
            </div>
          </div>

          {(feedback.next || []).length > 0 ? (
            <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              {feedback.next.map((step, index) => (
                <div key={index} className="flex min-h-24 items-start gap-3 rounded-xl border border-zinc-800 bg-black p-4 sm:p-5">
                  <ArrowRight size={17} className="mt-0.5 shrink-0 text-white" aria-hidden="true" />
                  <span className="text-sm leading-6 text-zinc-300">{step}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-7 text-sm leading-6 text-zinc-400">No additional follow-up steps were generated for this interview.</p>
          )}

          {feedback.daysToRevisit && feedback.daysToRevisit.length > 0 && (
            <div className="mt-8 border-t border-zinc-800 pt-6">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-white" aria-hidden="true" />
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">Recommended revision days</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {feedback.daysToRevisit.map((day) => (
                  <span key={day} className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-xs font-medium text-zinc-300">
                    Day {day}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center pt-8 sm:pt-10"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <Home size={17} aria-hidden="true" />
            Start another interview
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
