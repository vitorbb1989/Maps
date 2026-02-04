import { Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import * as Popover from '@radix-ui/react-popover';

export interface MindmapNodeData {
  id: string;
  text: string;
  parentId: string | null;
  x: number;
  y: number;
  isRoot?: boolean;
}

interface MindmapNodeProps {
  node: MindmapNodeData;
  onTextChange: (id: string, text: string) => void;
  onAddSubtopic: (parentId: string) => void;
  onAddSibling: (nodeId: string) => void;
  scale?: number;
}

export function MindmapNode({
  node,
  onTextChange,
  onAddSubtopic,
  onAddSibling,
  scale = 1,
}: MindmapNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.text);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNodeClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      setEditValue(node.text);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() !== '') {
      onTextChange(node.id, editValue.trim());
    } else {
      setEditValue(node.text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(node.text);
    }
  };

  const handleSubtopic = () => {
    onAddSubtopic(node.id);
    setIsMenuOpen(false);
  };

  const handleSibling = () => {
    onAddSibling(node.id);
    setIsMenuOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        transform: `translate(-50%, -50%)`,
      }}
      className="group"
    >
      <div className="flex items-center gap-2">
        {/* Node */}
        <div
          className={`
            relative flex min-h-[48px] min-w-[160px] max-w-[280px] items-center
            rounded-lg border bg-surface px-4 py-3 
            shadow-[var(--shadow-md)] transition-all duration-[var(--transition-base)]
            hover:shadow-[var(--shadow-lg)]
            ${
              node.isRoot
                ? 'border-[2px] border-primary font-semibold text-text'
                : 'border-border text-text'
            }
          `}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm outline-none"
              style={{ minWidth: '120px' }}
            />
          ) : (
            <button
              onClick={handleNodeClick}
              className="w-full text-left text-sm leading-relaxed"
            >
              {node.text}
            </button>
          )}
        </div>

        {/* Add Button with Menu */}
        <Popover.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <Popover.Trigger asChild>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-text-secondary opacity-0 shadow-[var(--shadow-sm)] transition-all duration-[var(--transition-fast)] hover:border-primary hover:bg-primary-bg hover:text-primary hover:shadow-[var(--shadow-md)] group-hover:opacity-100"
              aria-label="Adicionar nó"
            >
              <Plus className="h-4 w-4" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              side="right"
              align="center"
              sideOffset={8}
              className="z-50 w-72 rounded-lg border border-border bg-surface p-1 shadow-[var(--shadow-lg)] outline-none"
              style={{
                animationDuration: '200ms',
                animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  onClick={handleSubtopic}
                  className="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2.5 text-left transition-colors duration-[var(--transition-fast)] hover:bg-primary-bg"
                >
                  <span className="text-sm font-medium text-text">
                    Subtópico
                  </span>
                  <span className="text-xs text-text-secondary">
                    Cria um detalhe dentro deste item
                  </span>
                </button>

                {!node.isRoot && (
                  <button
                    onClick={handleSibling}
                    className="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2.5 text-left transition-colors duration-[var(--transition-fast)] hover:bg-primary-bg"
                  >
                    <span className="text-sm font-medium text-text">
                      Novo Tópico
                    </span>
                    <span className="text-xs text-text-secondary">
                      Cria outro item neste mesmo nível
                    </span>
                  </button>
                )}

                {node.isRoot && (
                  <div className="px-3 py-2 text-xs text-text-secondary">
                    A ideia central não possui "Novo Tópico"
                  </div>
                )}
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </motion.div>
  );
}
