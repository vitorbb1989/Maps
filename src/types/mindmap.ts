export type DocNode = {
  id: string
  position: { x: number; y: number }
  data: { label: string; parentId?: string }
}

export type DocEdge = {
  id: string
  source: string
  target: string
}

export type MindmapDoc = {
  nodes: DocNode[]
  edges: DocEdge[]
}
