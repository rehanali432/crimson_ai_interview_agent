import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertCircle, ArrowLeft, Bot, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { startInterview, sendMessage, getCandidate } from '../services/api';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import ProgressBar from '../components/ProgressBar';

export default function Interview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { sessionId: paramSessionId } = useParams();

  const sessionId = state?.sessionId || paramSessionId;
  const candidateId = state?.candidateId;

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(true);
  const [error, setError] = useState(null);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [candidateInfo, setCandidateInfo] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const initialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    if (!isThinking && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isThinking]);

  // Start interview session on mount
  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        setIsThinking(true);
        setError(null);

        let candidate = null;
        if (candidateId) {
          candidate = await getCandidate(candidateId);
          setCandidateInfo(candidate);
        }

        const res = await startInterview(sessionId, candidate);

        setMessages([
          { role: 'interviewer', content: res.reply }
        ]);
        setQuestionsAsked(0);
      } catch (err) {
        console.error('Failed to start interview:', err);
        setError('Failed to connect to the interviewer service. Please check your backend connection.');
      } finally {
        setIsThinking(false);
      }
    }

    init();
  }, [sessionId, candidateId, navigate]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || isThinking) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'candidate', content: userMsg }]);
    setIsThinking(true);
    setError(null);

    try {
      const res = await sendMessage(sessionId, userMsg);

      setMessages(prev => [
        ...prev,
        {
          role: 'interviewer',
          content: res.reply,
          strategy: res.strategy
        }
      ]);

      if (!res.done) {
        setQuestionsAsked(prev => prev + 1);
      }

      if (res.done) {
        setTimeout(() => {
          navigate(`/feedback/${sessionId}`, { state: { feedback: res.feedback } });
        }, 2500);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Connection timeout or LLM error. Please try resending your answer.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!sessionId) return null;

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Return to Home"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Live Interview Room</span>
              {candidateInfo?.member?.name && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
                  {candidateInfo.member.name}
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-slate-500">Session ID: {sessionId.substring(0, 16)}...</p>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-48 sm:w-64">
          <ProgressBar questionsAsked={questionsAsked} minQuestions={8} maxQuestions={12} />
        </div>
      </header>

      {/* Messages Conversation Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth z-10">
        <div className="max-w-4xl mx-auto space-y-4 pb-4">
          {messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              role={msg.role}
              content={msg.content}
              index={idx}
              strategy={msg.strategy}
            />
          ))}

          {isThinking && <TypingIndicator />}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3 max-w-lg mx-auto my-4"
            >
              <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Fixed Bottom Input Area */}
      <footer className="sticky bottom-0 z-30 backdrop-blur-xl bg-slate-950/90 border-t border-slate-800/80 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isThinking
                    ? "RAG pipeline processing next technical question..."
                    : "Type your technical response... (Press Enter to submit)"
                }
                disabled={isThinking}
                rows={1}
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 rounded-2xl px-5 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none resize-none disabled:opacity-50 transition-all shadow-inner leading-relaxed"
                style={{
                  minHeight: '52px',
                  maxHeight: '160px',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isThinking}
              className="w-13 h-13 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-950/50 flex-shrink-0 transition-all"
            >
              <Send size={18} />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
            <span>Crimson AI adaptively evaluates knowledge depth using curriculum RAG</span>
            <span className="hidden sm:inline">Press Enter to send · Shift+Enter for new line</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
