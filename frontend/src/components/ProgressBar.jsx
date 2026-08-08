import { motion } from 'framer-motion';

/**
 * Interview progress bar — shows how many questions have been asked
 * out of the expected range (8-12).
 */
export default function ProgressBar({ questionsAsked, minQuestions = 8, maxQuestions = 12 }) {
  const progress = Math.min((questionsAsked / maxQuestions) * 100, 100);
  const isNearEnd = questionsAsked >= minQuestions;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted font-medium">Interview Progress</span>
        <span className="text-xs text-text-secondary">
          {questionsAsked} / {maxQuestions} questions
        </span>
      </div>
      <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isNearEnd ? 'bg-success' : 'bg-white/30'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {isNearEnd && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-success mt-1.5"
        >
          Interview can wrap up soon
        </motion.p>
      )}
    </div>
  );
}
