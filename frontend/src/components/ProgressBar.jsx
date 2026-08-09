import { motion } from 'framer-motion';

export default function ProgressBar({ questionsAsked, minQuestions = 8, maxQuestions = 12 }) {
  const progress = Math.min((questionsAsked / maxQuestions) * 100, 100);
  const isNearEnd = questionsAsked >= minQuestions;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">Progress</span>
        <span className="text-[11px] text-zinc-400">
          {questionsAsked} / {maxQuestions} questions
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className={`h-full rounded-full ${isNearEnd ? 'bg-white' : 'bg-white/60'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {isNearEnd && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1.5 text-[10px] text-zinc-400"
        >
          Interview can wrap up soon
        </motion.p>
      )}
    </div>
  );
}
