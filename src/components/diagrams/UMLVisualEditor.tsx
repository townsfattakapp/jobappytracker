import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import { edgeTypes, UmlMarkers } from './edges';
import { v4 as uuidv4 } from 'uuid';

export interface UMLVisualEditorProps {
  initialState?: string;
  onSave: (visualState: string) => void;
  readOnly?: boolean;
}

export default function UMLVisualEditor({ initialState, onSave, readOnly }: UMLVisualEditorProps) {
  const parsedInitial = useMemo(() => {
    if (initialState) {
      try {
        return JSON.parse(initialState);
      } catch (e) {
        return { nodes: [], edges: [] };
      }
    }
    return { nodes: [], edges: [] };
  }, [initialState]);

  const [nodes, setNodes, onNodesChange] = useNodesState(parsedInitial.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(parsedInitial.edges || []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      // Default to simple association
      const newEdge = {
        ...params,
        type: 'umlEdge',
        id: `e${params.source}-${params.target}-${uuidv4().slice(0, 4)}`,
        data: { label: '' },
      };
      setEdges((eds) => addEdge(newEdge as any, eds));
    },
    [setEdges]
  );

  const handleAddClass = () => {
    const newNode = {
      id: `class-${uuidv4().slice(0, 4)}`,
      type: 'umlClass',
      position: { x: 100, y: 100 },
      data: {
        label: 'NewClass',
        attributes: ['-id: int'],
        methods: ['+getId(): int'],
        isInterface: false,
        isAbstract: false,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddActor = () => {
    const newNode = {
      id: `actor-${uuidv4().slice(0, 4)}`,
      type: 'umlActor',
      position: { x: 100, y: 100 },
      data: { label: 'Actor' },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddUseCase = () => {
    const newNode = {
      id: `usecase-${uuidv4().slice(0, 4)}`,
      type: 'umlUseCase',
      position: { x: 200, y: 100 },
      data: { label: 'New Use Case' },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  useEffect(() => {
    // Save visual state up
    const state = JSON.stringify({ nodes, edges });
    onSave(state);
  }, [nodes, edges, onSave]);

  return (
    <div className="flex h-[600px] w-full border border-border rounded-xl overflow-hidden bg-background">
      {/* Sidebar Palette */}
      {!readOnly && (
        <div className="w-64 border-r border-border bg-muted/20 flex flex-col p-4 space-y-4 z-10 shadow-sm">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Elements Palette</h3>
          
          <div className="space-y-2">
            <h4 className="text-xs font-semibold">Class Diagrams</h4>
            <button className="w-full btn btn-ghost justify-start border border-border bg-background" onClick={handleAddClass}>
              [C] Class
            </button>
            <button className="w-full btn btn-ghost justify-start border border-border bg-background" onClick={() => {
              const newNode = {
                id: `interface-${uuidv4().slice(0, 4)}`,
                type: 'umlClass',
                position: { x: 100, y: 100 },
                data: { label: 'NewInterface', attributes: [], methods: ['+method()'], isInterface: true },
              };
              setNodes((nds) => [...nds, newNode]);
            }}>
              [I] Interface
            </button>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/50">
            <h4 className="text-xs font-semibold">Use Case Diagrams</h4>
            <button className="w-full btn btn-ghost justify-start border border-border bg-background flex items-center gap-2" onClick={handleAddActor}>
              <span className="text-lg">👤</span> Actor
            </button>
            <button className="w-full btn btn-ghost justify-start border border-border bg-background rounded-full text-center block" onClick={handleAddUseCase}>
              Use Case
            </button>
          </div>
          
          <div className="mt-auto space-y-2 pt-4 border-t border-border/50 text-xs text-muted-foreground">
            <p>• Select a node to edit its properties.</p>
            <p>• Drag between handles to connect.</p>
            <p>• Select an edge and press Backspace to delete.</p>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onSelectionChange={(params) => {
            if (params.nodes.length === 1) setSelectedNode(params.nodes[0]);
            else setSelectedNode(null);
          }}
          fitView
          className="bg-background"
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
        >
          <UmlMarkers />
          <Controls />
          <MiniMap zoomable pannable />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* Properties Panel */}
      {!readOnly && selectedNode && (
        <div className="w-72 border-l border-border bg-muted/20 p-4 space-y-4 overflow-y-auto shadow-sm z-10">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Properties</h3>
          
          <label className="block">
            <span className="label-quiet">Name</span>
            <input 
              className="input-field" 
              value={selectedNode.data.label as string}
              onChange={(e) => {
                setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: e.target.value } } : n));
              }}
            />
          </label>

          {selectedNode.type === 'umlClass' && (
            <>
              <label className="block">
                <span className="label-quiet flex justify-between">Attributes <span className="text-[10px]">One per line</span></span>
                <textarea 
                  className="input-field min-h-[100px] text-xs font-mono" 
                  value={((selectedNode.data.attributes as string[]) || []).join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, attributes: lines } } : n));
                  }}
                />
              </label>

              <label className="block">
                <span className="label-quiet flex justify-between">Methods <span className="text-[10px]">One per line</span></span>
                <textarea 
                  className="input-field min-h-[100px] text-xs font-mono" 
                  value={((selectedNode.data.methods as string[]) || []).join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, methods: lines } } : n));
                  }}
                />
              </label>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={!!selectedNode.data.isInterface}
                    onChange={(e) => {
                      setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, isInterface: e.target.checked, isAbstract: false } } : n));
                    }}
                  />
                  Interface
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={!!selectedNode.data.isAbstract}
                    onChange={(e) => {
                      setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, isAbstract: e.target.checked, isInterface: false } } : n));
                    }}
                  />
                  Abstract
                </label>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-border">
            <button className="btn btn-ghost text-destructive w-full" onClick={() => setNodes(nds => nds.filter(n => n.id !== selectedNode.id))}>
              Delete Element
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
