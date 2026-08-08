import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-8xl font-bold text-text-muted mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          404
        </h1>
        <p className="text-xl text-text-secondary mb-8">
          This page doesn't exist.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-xl text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
}

export default NotFound;
