import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';

const PIPELINE_STEPS = [
  "Searching vector database (pgvector cosine similarity)...",
  "Analyzing candidate's mission history & skill gaps...",
  "Selecting optimal curriculum topic & difficulty...",
  "Synthesizing adaptive technical question..."
];

/**
 * Animated Typing & Pipeline Indicator — Monochrome Black & White Theme.
 */
export default function TypingIndicator() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const currentStep = PIPELINE_STEPS[stepIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex items-start gap-3.5 my-3 w-full"
    >
      {/* Bot Avatar - Monochrome */}
      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 shadow-md">
        <Bot size={18} className="text-slate-200 animate-pulse" />
      </div>

      {/* Indicator Card - Black & White */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-xs px-5 py-3.5 shadow-lg backdrop-blur-md max-w-md">
        {/* Pulsing Dots - White */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-slate-200"
                animate={{
                  scale: [0.7, 1.2, 0.7],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-200">AI Engine Processing</span>
        </div>

        {/* Step Progress Animation (No Icons, Plain Text) */}
        <div className="h-5 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-xs text-slate-400 font-mono"
            >
              <span className="truncate">{currentStep}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
