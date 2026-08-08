import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, AlertCircle, ArrowLeft } from 'lucide-react';
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

  // Keep short replies compact while allowing comfortable multi-line answers.
  // Resetting the height here also collapses the field after a message sends.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const maxHeight = 160;
    textarea.style.height = 'auto';
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${Math.max(nextHeight, 52)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [inputValue]);

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
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!sessionId) return null;

  return (
    <div className="h-[100dvh] min-h-[100dvh] overflow-hidden bg-black text-white flex flex-col">
      <header className="shrink-0 border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/')}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-zinc-950 text-zinc-300 transition-colors hover:border-white/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              title="Return to Home"
              aria-label="Return to home"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-semibold tracking-tight text-white sm:text-base">Interview session</span>
              {candidateInfo?.member?.name && (
                  <span className="hidden max-w-36 truncate rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-1 text-[10px] font-medium text-zinc-300 sm:inline-flex">
                  {candidateInfo.member.name}
                </span>
              )}
            </div>
              <p className="mt-0.5 hidden truncate font-mono text-[10px] text-zinc-500 sm:block">Session {sessionId.substring(0, 16)}...</p>
            </div>
          </div>

          <div className="w-24 shrink-0 sm:w-56">
            <ProgressBar questionsAsked={questionsAsked} minQuestions={8} maxQuestions={12} />
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto scroll-smooth" aria-label="Interview conversation">
        <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 sm:py-8" role="log" aria-live="polite" aria-relevant="additions">
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
              className="mx-auto my-4 flex max-w-xl items-start gap-3 rounded-2xl border border-white/20 bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-300"
              role="alert"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-white" aria-hidden="true" />
              <span>{error}</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="shrink-0 border-t border-white/10 bg-black px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pt-4">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSend} className="flex items-end gap-2 rounded-2xl border border-white/15 bg-zinc-950 p-2 shadow-[0_12px_36px_rgba(0,0,0,0.28)] transition-colors focus-within:border-white/35">
            <div className="min-w-0 flex-1">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isThinking
                    ? 'Preparing your next question...'
                    : 'Write your response...'
                }
                disabled={isThinking}
                rows={1}
                aria-label="Your interview response"
                aria-describedby="composer-hint"
                className="block min-h-[52px] max-h-40 w-full resize-none bg-transparent px-3 py-3 text-sm leading-6 text-white border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:text-zinc-500 shadow-none appearance-none"
                style={{
                  minHeight: '52px',
                  maxHeight: '160px',
                  outline: 'none',
                  boxShadow: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isThinking}
              aria-label="Send response"
              title="Send response"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-black transition-transform hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 disabled:hover:scale-100 cursor-pointer"
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </form>

          <div id="composer-hint" className="mt-2 flex items-center justify-end px-1 text-[10px] text-zinc-500">
            <span>Enter to send. Shift + Enter for a new line.</span>
          </div>

          <div className="hidden" aria-hidden="true">
            <span />
            <span className="hidden sm:inline">Press Enter to send · Shift+Enter for new line</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
