import { X, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface HistoryVersion {
  id: string;
  timestamp: string;
  nodeCount: number;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  versions: HistoryVersion[];
  isLoading?: boolean;
  onVersionSelect?: (versionId: string) => void;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  versions,
  isLoading = false,
  onVersionSelect,
}: HistoryDrawerProps) {
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
            className="fixed inset-0 z-40 bg-text/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed right-0 top-0 z-50 h-full w-full border-l border-border bg-surface shadow-[var(--shadow-lg)] md:max-w-md"
          >
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-border px-6">
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-text-secondary" />
                <h2 className="text-[15px] font-semibold text-text">
                  Histórico de Versões
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors duration-[var(--transition-fast)] hover:bg-bg hover:text-text"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-56px)] overflow-y-auto">
              {isLoading ? (
                <LoadingState />
              ) : versions.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="p-4 space-y-2">
                  {versions.map((version) => (
                    <VersionItem
                      key={version.id}
                      version={version}
                      onSelect={onVersionSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
      <p className="text-sm text-text-secondary">Carregando histórico...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <Clock className="h-12 w-12 text-text-secondary/40" />
      <div>
        <p className="text-sm font-medium text-text">
          Nenhuma versão salva ainda
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          Use "Salvar Versão" para criar snapshots do seu mindmap
        </p>
      </div>
    </div>
  );
}

interface VersionItemProps {
  version: HistoryVersion;
  onSelect?: (versionId: string) => void;
}

function VersionItem({ version, onSelect }: VersionItemProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) {
      return `Hoje às ${timeStr}`;
    } else if (isYesterday) {
      return `Ontem às ${timeStr}`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <button
      onClick={() => onSelect?.(version.id)}
      className="w-full rounded-lg border border-border bg-surface p-4 text-left transition-all duration-[var(--transition-fast)] hover:border-primary hover:bg-primary-bg hover:shadow-[var(--shadow-sm)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-text">
            {formatTimestamp(version.timestamp)}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {version.nodeCount} {version.nodeCount === 1 ? 'nó' : 'nós'}
          </p>
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-bg">
          <Clock className="h-3.5 w-3.5 text-text-secondary" />
        </div>
      </div>
    </button>
  );
}