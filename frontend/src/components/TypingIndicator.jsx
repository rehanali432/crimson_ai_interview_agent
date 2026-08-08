import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Database, Brain, Sparkles, Cpu } from 'lucide-react';

const PIPELINE_STEPS = [
  { icon: <Database size={13} className="text-indigo-400" />, text: "Searching vector database (pgvector cosine similarity)..." },
  { icon: <Brain size={13} className="text-purple-400" />, text: "Analyzing candidate's mission history & skill gaps..." },
  { icon: <Cpu size={13} className="text-cyan-400" />, text: "Selecting optimal curriculum topic & difficulty..." },
  { icon: <Sparkles size={13} className="text-emerald-400" />, text: "Synthesizing adaptive technical question..." },
];

/**
 * Animated Typing & Pipeline Indicator.
 * Shows cycling progress steps while waiting for RAG + LLM response.
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
      {/* Bot Avatar */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-900/80 to-slate-900 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-950/40">
        <Bot size={18} className="text-indigo-400 animate-pulse" />
      </div>

      {/* Indicator Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-xs px-5 py-3.5 shadow-lg backdrop-blur-md max-w-md">
        {/* Pulsing Dots */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-400"
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
          <span className="text-xs font-medium text-slate-300">RAG Engine Working</span>
        </div>

        {/* Step Progress Animation */}
        <div className="h-5 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2 text-xs text-slate-400 font-mono"
            >
              {currentStep.icon}
              <span className="truncate">{currentStep.text}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
