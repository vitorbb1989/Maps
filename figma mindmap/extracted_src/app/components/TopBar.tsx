import { ChevronLeft, Download, Clock, Check, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type SaveStatus = 'saved' | 'saving' | 'error';

interface TopBarProps {
  title: string;
  onTitleChange: (title: string) => void;
  saveStatus: SaveStatus;
  lastSavedTime?: string;
  onBack: () => void;
  onSave: () => void;
  onSnapshot: () => void;
  onHistoryOpen: () => void;
  onExport: () => void;
}

export function TopBar({
  title,
  onTitleChange,
  saveStatus,
  lastSavedTime,
  onBack,
  onSave,
  onSnapshot,
  onHistoryOpen,
  onExport,
}: TopBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleClick = () => {
    setIsEditing(true);
    setEditValue(title);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() !== '') {
      onTitleChange(editValue.trim());
    } else {
      setEditValue(title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(title);
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors duration-[var(--transition-fast)] hover:bg-bg hover:text-text"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Editable Title */}
          <div className="relative">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleKeyDown}
                className="h-8 rounded-md border border-border bg-surface px-3 text-[15px] font-medium text-text outline-none ring-2 ring-primary/20 transition-all"
                style={{ width: `${Math.max(editValue.length * 8.5, 120)}px` }}
              />
            ) : (
              <button
                onClick={handleTitleClick}
                className="group h-8 rounded-md px-3 text-[15px] font-medium text-text transition-colors duration-[var(--transition-fast)] hover:bg-bg"
              >
                {title}
                <span className="ml-2 opacity-0 transition-opacity duration-[var(--transition-fast)] group-hover:opacity-50">
                  ✏️
                </span>
              </button>
            )}
          </div>

          {/* Save Status */}
          <StatusChip status={saveStatus} lastSavedTime={lastSavedTime} />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <GhostButton onClick={onHistoryOpen}>
            <Clock className="h-4 w-4" />
            <span className="hidden md:inline">Histórico</span>
          </GhostButton>

          <GhostButton onClick={onSnapshot}>
            <span className="hidden lg:inline">Salvar Versão</span>
            <span className="lg:hidden">Versão</span>
          </GhostButton>

          <GhostButton onClick={onExport}>
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Exportar</span>
          </GhostButton>

          <PrimaryButton onClick={onSave}>
            <span>Salvar</span>
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

interface StatusChipProps {
  status: SaveStatus;
  lastSavedTime?: string;
}

function StatusChip({ status, lastSavedTime }: StatusChipProps) {
  const config = {
    saved: {
      icon: Check,
      text: lastSavedTime ? `Salvo ${lastSavedTime}` : 'Salvo',
      className: 'text-success bg-success-bg',
    },
    saving: {
      icon: Clock,
      text: 'Salvando...',
      className: 'text-text-secondary bg-bg',
    },
    error: {
      icon: AlertCircle,
      text: 'Erro ao salvar',
      className: 'text-error bg-error-bg',
    },
  };

  const { icon: Icon, text, className } = config[status];

  return (
    <div
      className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors duration-[var(--transition-base)] ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{text}</span>
    </div>
  );
}

interface PrimaryButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

function PrimaryButton({ onClick, children, disabled }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-[var(--shadow-sm)] transition-all duration-[var(--transition-fast)] hover:bg-primary/90 hover:shadow-[var(--shadow-md)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
    >
      {children}
    </button>
  );
}

interface GhostButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

function GhostButton({ onClick, children, disabled }: GhostButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-text-secondary transition-all duration-[var(--transition-fast)] hover:bg-bg hover:text-text active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
    >
      {children}
    </button>
  );
}