import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface EmptyHintProps {
  x: number;
  y: number;
}

export function EmptyHint({ x, y }: EmptyHintProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      style={{
        position: 'absolute',
        left: x + 200,
        top: y,
        transform: 'translateY(-50%)',
      }}
      className="pointer-events-none"
    >
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary-bg/50 px-4 py-2.5 shadow-[var(--shadow-sm)] backdrop-blur-sm">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-sm text-text-secondary">
          Clique no <span className="font-medium text-primary">+</span> para
          criar seu primeiro subtópico
        </p>
      </div>
    </motion.div>
  );
}
