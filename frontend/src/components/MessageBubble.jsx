import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';

/**
 * Chat message bubble — renders interviewer or candidate messages
 * with distinct, modern typography and clean theme styling.
 */
export default function MessageBubble({ role, content, index }) {
  const isInterviewer = role === 'interviewer' || role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.16), ease: [0.16, 1, 0.3, 1] }}
      className={`flex w-full items-start gap-2.5 sm:gap-3 ${isInterviewer ? 'justify-start' : 'justify-end'}`}
    >
      {/* AI Avatar */}
      {isInterviewer && (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-zinc-950 text-white">
          <Bot size={17} aria-hidden="true" />
        </div>
      )}

      {/* Message Content Container */}
      <div className={`flex min-w-0 max-w-[calc(100%-3rem)] flex-col ${isInterviewer ? 'items-start' : 'items-end'} sm:max-w-[76%]`}>
        {/* Role Label */}
        <div className="mb-1.5 px-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
            {isInterviewer ? 'AI Interviewer' : 'You'}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={`w-full break-words rounded-2xl px-4 py-3.5 text-sm leading-6 shadow-sm sm:px-5 sm:py-4 ${
            isInterviewer
              ? 'rounded-tl-sm border border-white/15 bg-zinc-950 text-zinc-100'
              : 'rounded-tr-sm bg-white text-black'
          }`}
        >
          <div className="max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                code: ({ children }) => (
                  <code className={`rounded px-1.5 py-0.5 font-mono text-xs ${isInterviewer ? 'border border-white/10 bg-white/[0.06] text-zinc-100' : 'bg-black/10 text-black'}`}>
                    {children}
                  </code>
                ),
                ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-4">{children}</ul>,
                ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-4">{children}</ol>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* User Avatar */}
      {!isInterviewer && (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-black">
          <User size={17} aria-hidden="true" />
        </div>
      )}
    </motion.div>
  );
}
