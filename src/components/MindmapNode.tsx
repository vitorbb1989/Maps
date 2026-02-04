import { ArrowRight, CornerDownRight, Plus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Handle, NodeProps, Position } from 'reactflow'

type MindmapNodeData = {
  label?: string
  autoEdit?: boolean
  parentId?: string
  isRoot?: boolean
  onAddChild?: () => void
  onAddSibling?: () => void
  onLabelChange?: (newLabel: string) => void
  onAutoEditEnd?: () => void
}

export const MindmapNode = ({ data, selected }: NodeProps<MindmapNodeData>) => {
  const [editing, setEditing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [draft, setDraft] = useState(data?.label ?? '')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!editing) setDraft(data?.label ?? '')
  }, [data?.label, editing])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  useEffect(() => {
    if (!data?.autoEdit) return
    setEditing(true)
    // Notify parent to remove autoEdit flag
    data.onAutoEditEnd?.()
  }, [data?.autoEdit, data])

  useEffect(() => {
    if (!editing) return
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [editing])

  const commit = () => {
    try {
      const nextLabel = draft.trim()
      const finalLabel = nextLabel.length ? nextLabel : 'Sem título'

      // Notify parent about label change
      data.onLabelChange?.(finalLabel)

      setEditing(false)
    } catch (error) {
      console.error('Erro ao salvar nó:', error)
      setEditing(false)
    }
  }

  const cancel = () => {
    setDraft(data?.label ?? '')
    setEditing(false)
  }

  const borderClass = useMemo(() => {
    if (data?.isRoot) return 'border-[2px] border-primary font-semibold text-text'
    return selected ? 'border-primary border-[1.5px]' : 'border-border'
  }, [selected, data?.isRoot])

  return (
    <div className="relative group">
      <div
        className={`
            relative flex min-h-[48px] min-w-[160px] max-w-[280px] items-center
            rounded-lg border bg-surface px-4 py-3
            shadow-[var(--shadow-md)] transition-all duration-[var(--transition-base)]
            hover:shadow-[var(--shadow-lg)]
            ${borderClass}
        `}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-2 h-2 !bg-surface !border !border-border opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-2 h-2 !bg-surface !border !border-border opacity-0 group-hover:opacity-100 transition-opacity"
        />

        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commit()
                if (!data?.isRoot) {
                  data?.onAddSibling?.()
                }
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                cancel()
              }
            }}
            className={`w-full bg-transparent text-text outline-none ${
              data?.isRoot ? 'font-semibold text-lg' : 'text-base'
            }`}
          />
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setEditing(true)
            }}
            className={`w-full text-left text-text leading-5 ${
              data?.isRoot ? 'font-semibold text-lg' : 'text-base'
            }`}
          >
            {data?.label ?? 'Sem título'}
          </button>
        )}
      </div>

      {/* Botão de Adição (Lado Direito) */}
      <div
        ref={menuRef}
        className={`absolute -right-4 top-1/2 -translate-y-1/2 flex items-center transition-opacity duration-200 ${
          showMenu || selected ? 'opacity-100 z-50' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          title="Adicionar..."
        >
          <Plus className="w-4 h-4" />
        </button>

        {showMenu && (
          <div className="absolute left-full top-0 ml-2 bg-surface border border-border rounded-lg shadow-xl p-2 flex flex-col gap-1 min-w-[220px] z-50 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation()
                data.onAddChild?.()
                setShowMenu(false)
              }}
              className="flex flex-col items-start gap-0.5 px-2 py-2 text-sm text-text hover:bg-surface-hover rounded-md w-full text-left transition-colors"
            >
              <div className="flex items-center gap-2 font-medium">
                <CornerDownRight size={14} className="text-primary" />
                <span>Subtópico</span>
              </div>
              <span className="text-[10px] text-text-secondary pl-6 leading-tight">
                Cria um detalhe dentro deste item
              </span>
            </button>
            {!data.isRoot && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  data.onAddSibling?.()
                  setShowMenu(false)
                }}
                className="flex flex-col items-start gap-0.5 px-2 py-2 text-sm text-text hover:bg-surface-hover rounded-md w-full text-left transition-colors"
              >
                <div className="flex items-center gap-2 font-medium">
                  <ArrowRight size={14} className="text-primary" />
                  <span>Novo Tópico</span>
                </div>
                <span className="text-[10px] text-text-secondary pl-6 leading-tight">
                  Cria outro item neste mesmo nível
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {!data?.isRoot && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(false)
            data.onAddSibling?.()
          }}
          className={`absolute left-1/2 -bottom-4 -translate-x-1/2 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-md transition-all ${
            selected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
          }`}
          title="Adicionar novo tópico"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
