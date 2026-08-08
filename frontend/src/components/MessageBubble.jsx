import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Sparkles } from 'lucide-react';

/**
 * Chat message bubble — renders interviewer or candidate messages
 * with distinct, modern typography and clean theme styling.
 */
export default function MessageBubble({ role, content, index, strategy }) {
  const isInterviewer = role === 'interviewer' || role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.2), ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-start gap-3.5 my-2.5 ${isInterviewer ? 'justify-start' : 'justify-end'} w-full`}
    >
      {/* AI Avatar */}
      {isInterviewer && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-900/80 to-slate-900 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-950/40">
          <Bot size={18} className="text-indigo-400" />
        </div>
      )}

      {/* Message Content Container */}
      <div className={`flex flex-col ${isInterviewer ? 'items-start' : 'items-end'} max-w-[82%] sm:max-w-[75%]`}>
        {/* Role Label */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {isInterviewer ? 'AI Interviewer' : 'You'}
          </span>
          {isInterviewer && strategy && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              <Sparkles size={10} />
              {strategy.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`px-5 py-4 rounded-2xl text-sm leading-relaxed backdrop-blur-md transition-all shadow-lg ${
            isInterviewer
              ? 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-xs shadow-black/30'
              : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs shadow-indigo-950/40 border border-indigo-500/30'
          }`}
        >
          <div className={`prose prose-invert prose-sm max-w-none ${isInterviewer ? 'text-slate-200' : 'text-white'}`}>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-indigo-300">{children}</strong>,
                code: ({ children }) => (
                  <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${isInterviewer ? 'bg-slate-800 text-indigo-300 border border-slate-700' : 'bg-indigo-800/60 text-indigo-100'}`}>
                    {children}
                  </code>
                ),
                ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* User Avatar */}
      {!isInterviewer && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-950/50">
          <User size={18} className="text-white" />
        </div>
      )}
    </motion.div>
  );
}
