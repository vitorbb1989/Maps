import { motion, AnimatePresence } from 'motion/react';
import { Command, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-text/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-[70] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-lg)]"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Command className="h-5 w-5 text-text-secondary" />
                <h2 className="text-[15px] font-semibold text-text">
                  Atalhos de Teclado
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors duration-[var(--transition-fast)] hover:bg-bg hover:text-text"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="space-y-3">
              <ShortcutItem keys={['⌘', 'S']} description="Salvar" />
              <ShortcutItem keys={['⌘', 'K']} description="Buscar" />
              <ShortcutItem keys={['Tab']} description="Próximo nó" />
              <ShortcutItem keys={['Shift', 'Tab']} description="Nó anterior" />
              <ShortcutItem keys={['Enter']} description="Editar nó" />
              <ShortcutItem keys={['Esc']} description="Cancelar edição" />
              <ShortcutItem keys={['+']} description="Adicionar nó" />
              <ShortcutItem keys={['Del']} description="Deletar nó" />
            </div>

            <div className="mt-6 rounded-lg bg-primary-bg p-3 text-center">
              <p className="text-xs text-text-secondary">
                Pressione <Kbd>?</Kbd> para exibir este menu
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ShortcutItemProps {
  keys: string[];
  description: string;
}

function ShortcutItem({ keys, description }: ShortcutItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md px-3 py-2 transition-colors duration-[var(--transition-fast)] hover:bg-bg">
      <span className="text-sm text-text">{description}</span>
      <div className="flex items-center gap-1.5">
        {keys.map((key, idx) => (
          <Kbd key={idx}>{key}</Kbd>
        ))}
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-border bg-surface px-2 text-xs font-medium text-text-secondary shadow-[var(--shadow-sm)]">
      {children}
    </kbd>
  );
}

// Hook para detectar atalhos
export function useKeyboardShortcuts() {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ? abre shortcuts
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }

      // Esc fecha shortcuts
      if (e.key === 'Escape' && isShortcutsOpen) {
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShortcutsOpen]);

  return { isShortcutsOpen, setIsShortcutsOpen };
}
