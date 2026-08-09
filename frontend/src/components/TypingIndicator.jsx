import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex w-full items-start gap-2.5 sm:gap-3"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-zinc-950 text-white">
        <Bot size={17} aria-hidden="true" />
      </div>

      <div className="rounded-2xl rounded-tl-sm border border-white/15 bg-zinc-950 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className="block h-1.5 w-1.5 rounded-full bg-white"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                transition={{ duration: 1.1, delay: index * 0.16, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-white">Preparing your next question</span>
        </div>
        <p className="mt-1.5 text-[11px] text-zinc-500">This usually takes a moment.</p>
      </div>
    </motion.div>
  );
}
