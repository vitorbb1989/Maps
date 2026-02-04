import { Plus, Minus, Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) {
  const percentage = Math.round(scale * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-lg border border-border bg-surface/90 p-2 shadow-[var(--shadow-lg)] backdrop-blur-xl"
    >
      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors duration-[var(--transition-fast)] hover:bg-bg hover:text-text active:scale-95"
        aria-label="Diminuir zoom"
      >
        <Minus className="h-4 w-4" />
      </button>

      {/* Scale Indicator */}
      <button
        onClick={onReset}
        className="flex h-8 min-w-[56px] items-center justify-center rounded-md px-2 text-xs font-medium text-text-secondary transition-colors duration-[var(--transition-fast)] hover:bg-bg hover:text-text"
        title="Resetar zoom (100%)"
      >
        {percentage}%
      </button>

      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors duration-[var(--transition-fast)] hover:bg-bg hover:text-text active:scale-95"
        aria-label="Aumentar zoom"
      >
        <Plus className="h-4 w-4" />
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Fit to View */}
      <button
        onClick={onReset}
        className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors duration-[var(--transition-fast)] hover:bg-bg hover:text-text active:scale-95"
        aria-label="Ajustar à tela"
        title="Ajustar à tela"
      >
        <Maximize2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
