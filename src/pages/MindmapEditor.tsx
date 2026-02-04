import { useAuth } from '@/components/AuthProvider'
import { MindmapNode } from '@/components/MindmapNode'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ArrowLeft, ArrowRight, Download, History, Loader2, RotateCcw, Save } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactFlow, {
    addEdge,
    Background,
    Connection,
    Controls,
    Edge,
    Node,
    Panel,
    ReactFlowProvider,
    useEdgesState,
    useNodesState
} from 'reactflow'
import 'reactflow/dist/style.css'

type DocNode = {
  id: string
  position: { x: number; y: number }
  data: { label: string; parentId?: string }
}

type DocEdge = {
  id: string
  source: string
  target: string
}

type MindmapDoc = {
  nodes: DocNode[]
  edges: DocEdge[]
}

type MindmapNodeData = {
  label: string
  autoEdit?: boolean
  parentId?: string
  isRoot?: boolean
  onAddChild?: () => void
  onAddSibling?: () => void
  onLabelChange?: (newLabel: string) => void
  onAutoEditEnd?: () => void
}

type FlowNode = Node<MindmapNodeData>
type FlowEdge = Edge

const useDebounce = <T,>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

const nodeTypes = { mindmap: MindmapNode }

const fromDocNodes = (docNodes: DocNode[]): FlowNode[] =>
  docNodes.map((n) => ({
    id: n.id,
    type: 'mindmap',
    position: n.position,
    data: n.data as any,
  }))

const fromDocEdges = (docEdges: DocEdge[]): FlowEdge[] =>
  docEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: false,
  }))

const serializeDoc = (nodes: FlowNode[], edges: FlowEdge[]): MindmapDoc => ({
  nodes: nodes.map((n) => ({
    id: n.id,
    position: n.position,
    data: {
      label: n.data.label,
      parentId: n.data.parentId,
    },
  })),
  edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
})

export const MindmapEditor = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isFirstRender = useRef(true)

  const [nodes, setNodes, onNodesChange] = useNodesState<MindmapNodeData>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([])

  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  useEffect(() => {
    edgesRef.current = edges
  }, [edges])

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null)

  const [title, setTitle] = useState('Mindmap')
  const [titleDraft, setTitleDraft] = useState(title)
  const [titleEditing, setTitleEditing] = useState(false)

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveNowLoading, setSaveNowLoading] = useState(false)
  const [lastSavedDoc, setLastSavedDoc] = useState<any>(null)

  const [showSnapshots, setShowSnapshots] = useState(false)
  const [snapshotsLoading, setSnapshotsLoading] = useState(false)
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [snapshotSaving, setSnapshotSaving] = useState(false)
  const [dirtySinceSnapshot, setDirtySinceSnapshot] = useState(false)

  const autoSnapshotBusyRef = useRef(false)

  const getParentId = useCallback((nodeId: string): string | null => {
    for (const e of edgesRef.current) {
      if (e.target === nodeId) return e.source
    }
    return null
  }, [])

  const isAncestor = useCallback(
    (ancestorId: string, descendantId: string): boolean => {
      const visited = new Set<string>()
      let current: string | null = descendantId
      while (current) {
        if (visited.has(current)) break
        visited.add(current)
        if (current === ancestorId) return true
        current = getParentId(current)
      }
      return false
    },
    [getParentId]
  )


  const applyEdgeStyles = useCallback(
    (
      eds: FlowEdge[],
      selNodeId: string | null,
      selEdgeId: string | null,
      hoverEdgeId: string | null
    ) => {
      return eds.map((e) => {
        const isSelected = e.id === selEdgeId
        const isHovered = e.id === hoverEdgeId
        const isConnectedToSelected = e.source === selNodeId || e.target === selNodeId

        let stroke = 'rgb(var(--border))'
        let strokeWidth = 2

        if (isSelected) {
          stroke = 'rgb(var(--primary))'
          strokeWidth = 3
        } else if (isHovered) {
          stroke = 'rgb(var(--primary))'
          strokeWidth = 2
        } else if (isConnectedToSelected) {
          stroke = 'rgb(var(--primary))'
          strokeWidth = 2
        }

        return {
          ...e,
          style: { stroke, strokeWidth },
          animated: isSelected || isHovered,
        }
      })
    },
    []
  )

  const onLabelChange = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== nodeId) return n
        return {
          ...n,
          data: {
            ...n.data,
            label: newLabel,
          },
        }
      })
    )
  }, [setNodes])

  const onAutoEditEnd = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== nodeId) return n
        const { autoEdit, ...rest } = n.data
        return {
          ...n,
          data: rest,
        }
      })
    )
  }, [setNodes])

  const createNodeNear = useCallback((anchorId: string, intent: 'sibling' | 'child') => {
    const currentNodes = nodesRef.current
    const anchor = currentNodes.find((n) => n.id === anchorId)
    if (!anchor) return

    const effectiveIntent = anchor.data?.isRoot && intent === 'sibling' ? 'child' : intent
    const parentId =
      effectiveIntent === 'child' ? anchor.id : (anchor.data?.parentId ?? anchor.id)

    const newId = `node-${Date.now()}`

    const newNode: FlowNode = {
      id: newId,
      type: 'mindmap',
      position: {
        x: 0,
        y: 0,
      },
      data: {
        label: 'Novo nó',
        autoEdit: true,
        parentId,
        onAddChild: () => createNodeNear(newId, 'child'),
        onAddSibling: () => createNodeNear(newId, 'sibling'),
        onLabelChange: (l) => onLabelChange(newId, l),
        onAutoEditEnd: () => onAutoEditEnd(newId),
      },
    }

    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId) ?? nds.find((n) => n.id === anchorId)
      if (!parentNode) return nds

      const childX = parentNode.position.x + 240
      const next: FlowNode[] = [
        ...nds.map((n) => ({ ...n, selected: false })),
        { ...newNode, position: { x: childX, y: parentNode.position.y }, selected: true },
      ]

      const children = next.filter((n) => n.data?.parentId === parentId)
      const ordered = children
        .filter((n) => n.id !== newId)
        .sort((a, b) => a.position.y - b.position.y)

      const inserted = children.find((n) => n.id === newId)
      if (inserted) {
        if (effectiveIntent === 'sibling') {
          const index = ordered.findIndex((n) => n.id === anchorId)
          if (index >= 0) ordered.splice(index + 1, 0, inserted)
          else ordered.push(inserted)
        } else {
          ordered.push(inserted)
        }
      }

      const gapY = 120
      const startY = parentNode.position.y - ((ordered.length - 1) * gapY) / 2
      const positions = new Map<string, { x: number; y: number }>()
      ordered.forEach((n, i) => {
        positions.set(n.id, { x: childX, y: startY + i * gapY })
      })

      return next.map((n) => {
        const pos = positions.get(n.id)
        if (!pos) return n
        return { ...n, position: pos }
      })
    })
    const edgeId = `edge-${parentId}-${newId}`
    setEdges((eds) => {
      const withoutDup = eds.filter((e) => e.id !== edgeId)
      return addEdge(
        { id: edgeId, source: parentId, target: newId, animated: false },
        withoutDup
      )
    })
    setSelectedNodeId(newId)
    setSelectedEdgeId(null)
  }, [onLabelChange, onAutoEditEnd, setEdges, setNodes])

  useEffect(() => {
    if (!id) return

    const loadMindmap = async () => {
      try {
        const { data, error } = await supabase
          .from('mindmaps')
          .select('id,title,current_doc_json')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Erro ao carregar mindmap:', error)
          alert('Erro ao carregar mindmap. Redirecionando...')
          navigate('/dashboard')
          return
        }

        if (!data) {
          alert('Mindmap não encontrado')
          navigate('/dashboard')
          return
        }

        setTitle(data.title)

        const doc: MindmapDoc | null = data.current_doc_json ?? null
        const docNodes = doc?.nodes?.length ? doc.nodes : [{
          id: `node-${Date.now()}`,
          position: { x: 0, y: 0 },
          data: { label: 'Ideia central' },
        }]
        const docEdges = doc?.edges?.length ? doc.edges : []
        const initialSelectedId = docNodes[0]?.id ?? null
        setSelectedNodeId(initialSelectedId)
        setNodes(
          fromDocNodes(docNodes).map((n, idx) => ({
            ...n,
            selected: initialSelectedId != null && n.id === initialSelectedId,
            data: {
              ...n.data,
              isRoot: idx === 0,
              onAddChild: () => createNodeNear(n.id, 'child'),
              onAddSibling: () => createNodeNear(n.id, 'sibling'),
              onLabelChange: (l) => onLabelChange(n.id, l),
              onAutoEditEnd: () => onAutoEditEnd(n.id),
            },
          }))
        )

        const nodesWithParentFromEdges = docNodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            parentId: n.data.parentId,
          },
        }))

        const incomingByTarget = new Map<string, string>()
        for (const e of docEdges) {
          if (!incomingByTarget.has(e.target)) incomingByTarget.set(e.target, e.source)
        }

        for (const n of nodesWithParentFromEdges) {
          if (n.data.parentId) continue
          const inferred = incomingByTarget.get(n.id)
          if (inferred) n.data.parentId = inferred
        }

        const edgeIdSet = new Set<string>()
        const usedIncomingTargets = new Set<string>()
        const normalizedEdges: DocEdge[] = []
        for (const e of docEdges) {
          if (usedIncomingTargets.has(e.target)) continue
          usedIncomingTargets.add(e.target)
          const key = `edge-${e.source}-${e.target}`
          if (edgeIdSet.has(key)) continue
          edgeIdSet.add(key)
          normalizedEdges.push({ id: key, source: e.source, target: e.target })
        }

        setEdges(applyEdgeStyles(fromDocEdges(normalizedEdges), initialSelectedId, null, null))
      } catch (error) {
        console.error('Erro crítico ao carregar:', error)
        alert('Erro ao carregar mindmap')
        navigate('/dashboard')
      }
    }

    loadMindmap()
  }, [id, navigate, setEdges, setNodes, createNodeNear, onLabelChange, onAutoEditEnd, applyEdgeStyles])

  useEffect(() => {
    setEdges((eds) => applyEdgeStyles(eds, selectedNodeId, selectedEdgeId, hoveredEdgeId))
  }, [applyEdgeStyles, hoveredEdgeId, selectedEdgeId, selectedNodeId, setEdges])

  const flowDoc = useMemo(() => serializeDoc(nodes, edges), [nodes, edges])
  const debouncedDoc = useDebounce(flowDoc, 3000)

  const hasSignificantChanges = (prev: any, next: any) => {
    if (!prev || !next) return true
    const prevStr = JSON.stringify(prev)
    const nextStr = JSON.stringify(next)
    return prevStr !== nextStr
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (!id || !debouncedDoc) return

    const currentDoc = serializeDoc(nodes, edges)
    if (!hasSignificantChanges(lastSavedDoc, currentDoc)) return

    const save = async () => {
      setSaveStatus('saving')
      try {
        const { error } = await supabase
          .from('mindmaps')
          .update({
            current_doc_json: debouncedDoc,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)

        if (error) {
          console.error('Erro ao salvar:', error)
          setSaveStatus('error')
          return
        }

        setLastSaved(new Date())
        setSaveStatus('saved')
        setDirtySinceSnapshot(true)
        setLastSavedDoc(currentDoc)
      } catch (error) {
        console.error('Erro ao salvar:', error)
        setSaveStatus('error')
      }
    }

    save()
  }, [debouncedDoc, id, nodes, edges, lastSavedDoc])

  const onConnect = useCallback(
    (params: Connection) => {
      const source = params.source
      const target = params.target
      if (!source || !target) return
      if (source === target) return

      if (isAncestor(target, source)) return

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== target) return n
          return {
            ...n,
            data: { ...n.data, parentId: source },
          }
        })
      )

      setEdges((eds) => {
        const withoutTargetIncoming = eds.filter((e) => e.target !== target)
        return addEdge({ ...params, animated: false }, withoutTargetIncoming)
      })

      setSelectedNodeId(target)
      setSelectedEdgeId(null)
    },
    [isAncestor, setEdges, setNodes]
  )

  const deleteNodeSubtreeById = useCallback(
    (rootId: string) => {
      const toDelete = new Set<string>()
      const queue = [rootId]
      while (queue.length) {
        const current = queue.shift()!
        if (toDelete.has(current)) continue
        toDelete.add(current)
        nodes
          .filter((n) => getParentId(n.id) === current)
          .forEach((n) => queue.push(n.id))
      }

      const remaining = nodes.filter((n) => !toDelete.has(n.id))
      const remainingIds = new Set(remaining.map((n) => n.id))
      const remainingEdges = edges.filter(
        (e) => remainingIds.has(e.source) && remainingIds.has(e.target)
      )

      const nextSelectedId = remaining[0]?.id ?? null
      setSelectedNodeId(nextSelectedId)
      setSelectedEdgeId(null)

      setNodes(remaining.map((n) => ({ ...n, selected: n.id === nextSelectedId })))
      setEdges(applyEdgeStyles(remainingEdges, nextSelectedId, null, hoveredEdgeId))
    },
    [applyEdgeStyles, edges, getParentId, hoveredEdgeId, nodes, setEdges, setNodes]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedNodeId) return
      if (e.isComposing) return

      const selected = nodes.find((n) => n.id === selectedNodeId)
      if (!selected) return

      if (e.key === 'Tab') {
        e.preventDefault()
        createNodeNear(selected.id, 'child')
      } else if (e.key === 'Enter') {
        e.preventDefault()
        createNodeNear(selected.id, 'sibling')
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault()
        deleteNodeSubtreeById(selectedNodeId)
      }
    },
    [createNodeNear, deleteNodeSubtreeById, nodes, selectedNodeId]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])


  const loadSnapshots = useCallback(async () => {
    if (!id) return
    setSnapshotsLoading(true)
    const { data } = await supabase
      .from('mindmap_snapshots')
      .select('*')
      .eq('mindmap_id', id)
      .order('created_at', { ascending: false })
      .limit(20)
    setSnapshots(data || [])
    setSnapshotsLoading(false)
  }, [id])

  useEffect(() => {
    if (!showSnapshots) return
    loadSnapshots()
  }, [loadSnapshots, showSnapshots])

  const restoreSnapshot = (snapshot: any) => {
    if (!confirm('Restaurar esta versão vai substituir o estado atual. Continuar?')) return
    const doc: MindmapDoc = snapshot.doc_json
    const restoredNodes = fromDocNodes(doc?.nodes ?? [])
    const initialSelectedId = restoredNodes[0]?.id ?? null
    setSelectedNodeId(initialSelectedId)
    setSelectedEdgeId(null)
    setNodes(
      restoredNodes.map((n) => ({
        ...n,
        selected: initialSelectedId != null && n.id === initialSelectedId,
        data: {
          ...n.data,
          onAddChild: () => createNodeNear(n.id, 'child'),
          onAddSibling: () => createNodeNear(n.id, 'sibling'),
          onLabelChange: (l) => onLabelChange(n.id, l),
          onAutoEditEnd: () => onAutoEditEnd(n.id),
        }
      }))
    )
    setEdges(applyEdgeStyles(fromDocEdges(doc?.edges ?? []), initialSelectedId, null, null))
    setShowSnapshots(false)
    setDirtySinceSnapshot(true)
  }

  const createSnapshot = useCallback(async () => {
    if (!id || !user) return
    if (snapshotSaving) return

    setSnapshotSaving(true)
    const { error } = await supabase.from('mindmap_snapshots').insert({
      mindmap_id: id,
      user_id: user.id,
      doc_json: serializeDoc(nodes, edges),
    })
    setSnapshotSaving(false)

    if (error) return

    setDirtySinceSnapshot(false)
    if (showSnapshots) loadSnapshots()
  }, [edges, id, loadSnapshots, nodes, showSnapshots, snapshotSaving, user])

  useEffect(() => {
    if (!id || !user) return

    const interval = window.setInterval(async () => {
      if (autoSnapshotBusyRef.current) return
      if (!dirtySinceSnapshot) return

      autoSnapshotBusyRef.current = true
      await createSnapshot()
      autoSnapshotBusyRef.current = false
    }, 180000)

    return () => window.clearInterval(interval)
  }, [createSnapshot, dirtySinceSnapshot, id, user])

  const saveNow = async () => {
    if (!id) return
    setSaveNowLoading(true)
    setSaveStatus('saving')
    const { error } = await supabase
      .from('mindmaps')
      .update({
        current_doc_json: serializeDoc(nodes, edges),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    setSaveNowLoading(false)

    if (error) {
      setSaveStatus('error')
      return
    }

    setLastSaved(new Date())
    setSaveStatus('saved')
    setDirtySinceSnapshot(true)
  }

  const handleExport = () => {
    const doc = serializeDoc(nodes, edges)
    const blob = new Blob([JSON.stringify({ title, ...doc }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'mindmap'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleTitleBlur = () => {
    setTitleEditing(false)
    setTitle(titleDraft)
    updateTitle()
  }

  const updateTitle = async () => {
    if (!id) return
    const nextTitle = title.trim().length ? title.trim() : 'Sem título'
    setTitle(nextTitle)
    await supabase.from('mindmaps').update({ title: nextTitle }).eq('id', id)
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen bg-bg text-text flex flex-col overflow-hidden">
        {/* Figma-styled TopBar */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-xl h-14 shrink-0">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors duration-[var(--transition-fast)] hover:bg-bg hover:text-text"
                title="Voltar ao dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="relative">
                {titleEditing ? (
                  <input
                    type="text"
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleTitleBlur()
                      }
                      if (e.key === 'Escape') {
                        setTitleEditing(false)
                        setTitleDraft(title)
                      }
                    }}
                    className="h-8 rounded-md border border-border bg-surface px-3 text-[15px] font-medium text-text outline-none ring-2 ring-primary/20 transition-all"
                    style={{ width: `${Math.max(titleDraft.length * 9, 120)}px` }}
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => {
                      setTitleEditing(true)
                      setTitleDraft(title)
                    }}
                    className="group h-8 rounded-md px-3 text-[15px] font-medium text-text transition-colors duration-[var(--transition-fast)] hover:bg-bg flex items-center gap-2"
                  >
                    {title}
                    <span className="opacity-0 transition-opacity duration-[var(--transition-fast)] group-hover:opacity-50 text-xs">
                      ✏️
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {saveStatus === 'saving' && (
                <span className="text-sm text-text-secondary flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </span>
              )}
              {saveStatus === 'saved' && lastSaved && (
                <span className="text-sm text-text-secondary">
                  Salvo {format(lastSaved, 'HH:mm')}
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-sm text-danger">Erro ao salvar</span>
              )}

              <button
                onClick={saveNow}
                disabled={saveNowLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border hover:border-border-hover rounded-md transition duration-[var(--transition-base)] text-sm font-medium disabled:opacity-50 hover:bg-surface-hover shadow-sm"
                title="Salvar agora"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Salvar</span>
              </button>

              <button
                onClick={() => setShowSnapshots(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border hover:border-border-hover rounded-md transition duration-[var(--transition-base)] text-sm font-medium hover:bg-surface-hover shadow-sm"
                title="Histórico"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Histórico</span>
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border hover:border-border-hover rounded-md transition duration-[var(--transition-base)] text-sm font-medium hover:bg-surface-hover shadow-sm"
                title="Exportar JSON"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </div>
          </div>
        </header>

        {/* Snapshots Panel */}
        {showSnapshots && (
          <div className="fixed inset-y-0 right-0 w-80 bg-surface border-l border-border shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface/80 backdrop-blur-sm">
              <h2 className="font-semibold text-text">Histórico de Versões</h2>
              <button
                onClick={() => setShowSnapshots(false)}
                className="p-1 hover:bg-surface-hover rounded-md text-text-secondary transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {snapshotsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : snapshots.length === 0 ? (
                <div className="text-center py-8 text-text-secondary text-sm">
                  Nenhuma versão salva
                </div>
              ) : (
                snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-3 rounded-lg border border-border bg-surface hover:border-primary/50 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text">
                        {format(new Date(snap.created_at), 'dd/MM HH:mm')}
                      </span>
                      <button
                        onClick={() => restoreSnapshot(snap)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-primary hover:bg-primary-bg rounded-md transition-all"
                        title="Restaurar esta versão"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-text-secondary">
                      {snap.doc_json?.nodes?.length ?? 0} nós
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => {
              setSelectedNodeId(node.id)
              setSelectedEdgeId(null)
            }}
            onEdgeClick={(_, edge) => {
              setSelectedEdgeId(edge.id)
              setSelectedNodeId(null)
            }}
            onEdgeMouseEnter={(_, edge) => setHoveredEdgeId(edge.id)}
            onEdgeMouseLeave={() => setHoveredEdgeId(null)}
            onPaneClick={() => {
              setSelectedNodeId(null)
              setSelectedEdgeId(null)
            }}
            fitView
            className="bg-bg"
            minZoom={0.1}
            maxZoom={2}
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { strokeWidth: 2, stroke: 'rgb(var(--border))' },
            }}
          >
            <Background color="rgb(var(--border))" gap={24} size={1} />
            <Controls className="!bg-surface !border-border !shadow-md !m-4" />
            <Panel position="bottom-center" className="mb-8">
              <div className="bg-surface/90 backdrop-blur-md border border-border rounded-full px-4 py-2 text-xs text-text-secondary shadow-lg flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-bg border border-border font-mono text-[10px]">Tab</kbd>
                  <span>Filho</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-bg border border-border font-mono text-[10px]">Enter</kbd>
                  <span>Irmão</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-bg border border-border font-mono text-[10px]">Del</kbd>
                  <span>Excluir</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </ReactFlowProvider>
  )
}
