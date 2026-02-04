import { HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface HelpButtonProps {
  onClick: () => void;
}

export function HelpButton({ onClick }: HelpButtonProps) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            onClick={onClick}
            className="fixed bottom-6 left-6 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/90 text-text-secondary shadow-[var(--shadow-lg)] backdrop-blur-xl transition-all duration-[var(--transition-base)] hover:border-primary hover:bg-primary hover:text-white hover:shadow-[var(--shadow-lg)] active:scale-95"
            aria-label="Ajuda e atalhos"
          >
            <HelpCircle className="h-5 w-5" />
          </motion.button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            sideOffset={8}
            className="z-50 rounded-md bg-text px-3 py-1.5 text-xs text-surface shadow-[var(--shadow-md)]"
          >
            Pressione <kbd className="mx-1 font-medium">?</kbd> para atalhos
            <Tooltip.Arrow className="fill-text" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
