import { useState, useEffect, useCallback, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { TopBar } from './components/TopBar';
import { MindmapNode, type MindmapNodeData } from './components/MindmapNode';
import { HistoryDrawer, type HistoryVersion } from './components/HistoryDrawer';
import { EmptyHint } from './components/EmptyHint';
import { KeyboardShortcuts, useKeyboardShortcuts } from './components/KeyboardShortcuts';
import { ZoomControls } from './components/ZoomControls';
import { HelpButton } from './components/HelpButton';

interface NodeWithChildren extends MindmapNodeData {
  children: NodeWithChildren[];
}

export default function App() {
  const [title, setTitle] = useState('Meu Mindmap');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState('15:32');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const { isShortcutsOpen, setIsShortcutsOpen } = useKeyboardShortcuts();
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const [nodes, setNodes] = useState<MindmapNodeData[]>([
    {
      id: 'root',
      text: 'Ideia Central',
      parentId: null,
      x: 0,
      y: 0,
      isRoot: true,
    },
  ]);
  const [versions] = useState<HistoryVersion[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      nodeCount: 5,
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      nodeCount: 3,
    },
  ]);

  // Auto-save simulation
  useEffect(() => {
    if (nodes.length > 1) {
      setSaveStatus('saving');
      const timer = setTimeout(() => {
        setSaveStatus('saved');
        const now = new Date();
        setLastSavedTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [nodes]);

  // Calculate node positions with auto-centering
  const calculatePositions = useCallback((nodeList: MindmapNodeData[]) => {
    const rootNode = nodeList.find((n) => n.isRoot);
    if (!rootNode) return nodeList;

    // Build tree structure
    const buildTree = (parentId: string | null): NodeWithChildren[] => {
      return nodeList
        .filter((n) => n.parentId === parentId)
        .map((n) => ({
          ...n,
          children: buildTree(n.id),
        }));
    };

    const tree: NodeWithChildren = {
      ...rootNode,
      children: buildTree(rootNode.id),
    };

    // Calculate positions recursively
    const HORIZONTAL_SPACING = 280;
    const VERTICAL_SPACING = 100;

    const layoutTree = (
      node: NodeWithChildren,
      x: number,
      y: number,
      level: number
    ): MindmapNodeData[] => {
      const result: MindmapNodeData[] = [{ ...node, x, y }];

      if (node.children.length === 0) return result;

      // Calculate total height needed for children
      const totalHeight = (node.children.length - 1) * VERTICAL_SPACING;
      let currentY = y - totalHeight / 2;

      node.children.forEach((child) => {
        const childX = x + HORIZONTAL_SPACING;
        const childNodes = layoutTree(child, childX, currentY, level + 1);
        result.push(...childNodes);
        currentY += VERTICAL_SPACING;
      });

      return result;
    };

    return layoutTree(tree, 0, 0, 0);
  }, []);

  // Update positions when nodes change
  useEffect(() => {
    setNodes((current) => calculatePositions(current));
  }, []); // Only on mount to prevent infinite loop

  const handleNodeTextChange = (id: string, text: string) => {
    setNodes((current) =>
      current.map((node) => (node.id === id ? { ...node, text } : node))
    );
  };

  const handleAddSubtopic = (parentId: string) => {
    const newNode: MindmapNodeData = {
      id: `node-${Date.now()}`,
      text: 'Novo subtópico',
      parentId,
      x: 0,
      y: 0,
    };

    setNodes((current) => {
      const updated = [...current, newNode];
      return calculatePositions(updated);
    });
  };

  const handleAddSibling = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !node.parentId) return;

    const newNode: MindmapNodeData = {
      id: `node-${Date.now()}`,
      text: 'Novo tópico',
      parentId: node.parentId,
      x: 0,
      y: 0,
    };

    setNodes((current) => {
      const updated = [...current, newNode];
      return calculatePositions(updated);
    });
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 600);
  };

  const handleSnapshot = () => {
    console.log('Saving snapshot with', nodes.length, 'nodes');
    handleSave();
  };

  const handleExport = () => {
    const data = { title, nodes };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    console.log('Navigate back');
  };

  // Draw connections between nodes
  const connections = nodes
    .filter((node) => node.parentId)
    .map((node) => {
      const parent = nodes.find((n) => n.id === node.parentId);
      if (!parent) return null;
      return { from: parent, to: node };
    })
    .filter(Boolean);

  const isEmptyState = nodes.length === 1 && nodes[0].isRoot;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-bg">
      <TopBar
        title={title}
        onTitleChange={setTitle}
        saveStatus={saveStatus}
        lastSavedTime={lastSavedTime}
        onBack={handleBack}
        onSave={handleSave}
        onSnapshot={handleSnapshot}
        onHistoryOpen={() => setIsHistoryOpen(true)}
        onExport={handleExport}
      />

      <div className="relative flex-1 overflow-hidden">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={2}
          centerOnInit
          limitToBounds={false}
          doubleClick={{ disabled: true }}
          panning={{ velocityDisabled: true }}
          wheel={{ smoothStep: 0.005 }}
          ref={transformRef}
          onZoomChange={(e) => setScale(e.state.scale)}
        >
          <TransformComponent
            wrapperClass="!w-full !h-full"
            contentClass="!w-full !h-full"
          >
            <div className="relative h-full w-full">
              {/* Canvas Grid (subtle) */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                style={{ opacity: 0.4 }}
              >
                <defs>
                  <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle
                      cx="1"
                      cy="1"
                      r="1"
                      fill="var(--canvas-grid)"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Canvas Content Container */}
              <div
                className="absolute left-1/2 top-1/2"
                style={{ transform: 'translate(0, 0)' }}
              >
                {/* Connections (lines between nodes) */}
                <svg
                  className="pointer-events-none absolute"
                  style={{
                    left: '-2000px',
                    top: '-2000px',
                    width: '4000px',
                    height: '4000px',
                  }}
                >
                  {connections.map((conn, idx) => {
                    if (!conn) return null;
                    const { from, to } = conn;
                    
                    // Calculate line positions (accounting for svg offset)
                    const x1 = from.x + 2000;
                    const y1 = from.y + 2000;
                    const x2 = to.x + 2000;
                    const y2 = to.y + 2000;
                    
                    // Bezier curve for smooth connections
                    const midX = (x1 + x2) / 2;
                    
                    return (
                      <path
                        key={idx}
                        d={`M ${x1} ${y1} Q ${midX} ${y1}, ${midX} ${(y1 + y2) / 2} T ${x2} ${y2}`}
                        stroke="var(--canvas-connection)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>

                {/* Nodes */}
                {nodes.map((node) => (
                  <MindmapNode
                    key={node.id}
                    node={node}
                    onTextChange={handleNodeTextChange}
                    onAddSubtopic={handleAddSubtopic}
                    onAddSibling={handleAddSibling}
                  />
                ))}

                {/* Empty State Hint */}
                {isEmptyState && (
                  <EmptyHint x={nodes[0].x} y={nodes[0].y} />
                )}
              </div>
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        versions={versions}
        onVersionSelect={(id) => console.log('Selected version:', id)}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Zoom Controls */}
      <ZoomControls
        scale={scale}
        onZoomIn={() => transformRef.current?.zoomIn()}
        onZoomOut={() => transformRef.current?.zoomOut()}
        onReset={() => transformRef.current?.resetTransform()}
      />

      {/* Help Button */}
      <HelpButton onClick={() => setIsShortcutsOpen(true)} />
    </div>
  );
}