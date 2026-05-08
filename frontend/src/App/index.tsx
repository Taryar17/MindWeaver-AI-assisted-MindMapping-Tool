import {
  ReactFlow,
  Controls,
  Panel,
  type NodeOrigin,
  type OnConnectStart,
  type OnConnectEnd,
  type InternalNode,
  useStoreApi,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
  Background,
  MiniMap,
  type Node,
  addEdge,
  type Connection,
} from "@xyflow/react";
import { shallow } from "zustand/shallow";
import MindMapNodes from "./MindMapNode";
import MindMapEdge from "./MindMapEdge";
import { NodeContextMenu } from "./NodeContextMenu";

import useStore, { type RFState } from "./store";

import "@xyflow/react/dist/style.css";
import { useCallback, useRef, useState, useEffect } from "react";
import { Move, Plus } from "lucide-react";
import { nanoid } from "nanoid/non-secure";
import { AILoadingIndicator } from "@/components/util/AI-Loading-Indicator";

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  setEdges: state.setEdges,
  addChildNode: state.addChildNode,
  addSiblingNode: state.addSiblingNode,
  deleteNode: state.deleteNode,
  deleteEdge: state.deleteEdge,
  generateChildIdeas: state.generateChildIdeas,
  suggestRelatedConcepts: state.suggestRelatedConcepts,
  expandIntoSummary: state.expandIntoSummary,
  selectedNodeId: state.selectedNodeId,
  selectedEdgeId: state.selectedEdgeId,
  setSelectedNode: state.setSelectedNode,
  setSelectedEdge: state.setSelectedEdge,
  updateNodeColor: state.updateNodeColor,
  updateNodeShape: state.updateNodeShape,
  updateEdgeType: state.updateEdgeType,
  isGeneratingAI: state.isGeneratingAI,
  aiGenerationType: state.aiGenerationType,
});

const nodeOrigin: NodeOrigin = [0.5, 0.5];

const nodeTypes: NodeTypes = {
  mindmap: MindMapNodes,
};

const edgeTypes: EdgeTypes = {
  mindmap: MindMapEdge,
};

const PRESET_COLORS = [
  "#ffffff",
  "#ffd166",
  "#ef476f",
  "#06d6a0",
  "#118ab2",
  "#8338ec",
];

export function Flow() {
  const store = useStoreApi();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setEdges,
    addChildNode,
    addSiblingNode,
    deleteNode,
    deleteEdge,
    generateChildIdeas,
    suggestRelatedConcepts,
    expandIntoSummary,
    selectedEdgeId,
    selectedNodeId,
    setSelectedEdge,
    setSelectedNode,
    updateEdgeType,
    updateNodeColor,
    updateNodeShape,
    isGeneratingAI,
    aiGenerationType,
  } = useStore(selector, shallow);

  const { screenToFlowPosition, getZoom } = useReactFlow();
  const [zoom, setZoom] = useState(100);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);

  // Update zoom display
  const updateZoom = useCallback(() => {
    setZoom(Math.round(getZoom() * 100));
  }, [getZoom]);

  const connectingNodeId = useRef<string | null>(null);

  // Handle node-to-node connections
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: nanoid(),
        data: {
          edgeType: "straight",
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges],
  );

  const getChildNodePosition = useCallback(
    (event: MouseEvent | TouchEvent, parentId?: InternalNode) => {
      const { domNode } = store.getState();

      if (
        !domNode ||
        !parentId?.internals?.positionAbsolute ||
        !parentId?.measured?.width ||
        !parentId?.measured?.height
      ) {
        return;
      }

      const panePosition = screenToFlowPosition({
        x: "clientX" in event ? event.clientX : event.touches[0].clientX,
        y: "clientY" in event ? event.clientY : event.touches[0].clientY,
      });

      return {
        x:
          panePosition.x -
          parentId.internals?.positionAbsolute.x +
          parentId.measured?.width / 2,
        y:
          panePosition.y -
          parentId.internals?.positionAbsolute.y +
          parentId.measured?.height / 2,
      };
    },
    [store, screenToFlowPosition],
  );

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const { nodeLookup } = store.getState();
      const targetIsPane = (event.target as Element).classList.contains(
        "react-flow__pane",
      );

      if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeLookup.get(connectingNodeId.current);
        const childNodePosition = getChildNodePosition(event, parentNode);

        if (parentNode && childNodePosition) {
          addChildNode(parentNode, childNodePosition);
        }
      }
    },
    [getChildNodePosition, store, addChildNode],
  );

  const nodeColor = (node: any) => {
    return node?.data?.color || "#06b6d4";
  };

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      event.stopPropagation();
      setSelectedNode(node.id);
      setSelectedEdge(null);
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    [setSelectedNode, setSelectedEdge],
  );

  // Handle keyboard deletion
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete") {
        if (selectedNodeId) {
          deleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          deleteEdge(selectedEdgeId);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedNodeId, selectedEdgeId, deleteNode, deleteEdge]);

  // Handle node actions
  const handleAddChild = useCallback(() => {
    if (contextMenu?.nodeId) {
      const parentNode = nodes.find((n) => n.id === contextMenu.nodeId);
      if (parentNode) {
        const center = screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        });
        addChildNode(parentNode, center);
      }
    }
  }, [contextMenu, nodes, addChildNode, screenToFlowPosition]);

  const handleAddSibling = useCallback(() => {
    if (contextMenu?.nodeId) {
      const currentNode = nodes.find((n) => n.id === contextMenu.nodeId);
      if (currentNode && currentNode.parentId) {
        const parentNode = nodes.find((n) => n.id === currentNode.parentId);
        if (parentNode) {
          const center = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          });
          addChildNode(parentNode, center);
        }
      }
    }
  }, [contextMenu, nodes, addChildNode, screenToFlowPosition]);

  const handleEdit = useCallback(() => {
    const nodeElement = document.querySelector(
      `[data-id="${contextMenu?.nodeId}"] input`,
    );
    if (nodeElement) {
      (nodeElement as HTMLInputElement).focus();
    }
  }, [contextMenu]);

  const handleDelete = useCallback(() => {
    if (contextMenu?.nodeId) {
      if (window.confirm("Are you sure you want to delete this node?")) {
        deleteNode(contextMenu.nodeId);
      }
    }
  }, [contextMenu, deleteNode]);

  // AI action handlers
  const handleGenerateChildIdeas = useCallback(() => {
    if (contextMenu?.nodeId) {
      generateChildIdeas(contextMenu.nodeId);
    }
  }, [contextMenu, generateChildIdeas]);

  const handleSuggestConcepts = useCallback(() => {
    if (contextMenu?.nodeId) {
      suggestRelatedConcepts(contextMenu.nodeId);
    }
  }, [contextMenu, suggestRelatedConcepts]);

  const handleExpandSummary = useCallback(() => {
    if (contextMenu?.nodeId) {
      expandIntoSummary(contextMenu.nodeId);
    }
  }, [contextMenu, expandIntoSummary]);

  return (
    <div style={{ width: "100%", height: "100%" }} className="relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodeOrigin={nodeOrigin}
        fitView
        onNodeClick={(_, node) => {
          setSelectedNode(node.id);
          setSelectedEdge(null);
        }}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeClick={(_, edge) => {
          setSelectedEdge(edge.id);
          setSelectedNode(null);
        }}
        onPaneClick={() => {
          setSelectedNode(null);
          setSelectedEdge(null);
          setContextMenu(null);
        }}
        onMove={updateZoom}
      >
        <Controls />
        <Background className="bg-background" />

        <Panel position="top-right" className="mt-16 ml-4">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 w-64">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Quick Guide
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Move size={14} className="text-primary" />
                <span>Drag nodes to move</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold">Shift</span>
                <span>+ Click to connect</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">Double-click</span>
                <span>to edit</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">Right-click</span>
                <span>for options</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">Delete key</span>
                <span>to delete selected</span>
              </li>
            </ul>

            <button
              onClick={() => {
                const center = screenToFlowPosition({
                  x: window.innerWidth / 2,
                  y: window.innerHeight / 2,
                });

                const parentNode =
                  nodes.find((n) => n.id === selectedNodeId) || nodes[0];

                if (parentNode) {
                  addChildNode(parentNode, center);
                }
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-md transition-colors"
            >
              <Plus size={16} />
              Add Node
            </button>
          </div>
        </Panel>

        {(selectedNodeId || selectedEdgeId) && (
          <Panel position="top-left" className="mt-16 mr-4">
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 w-64">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {selectedNodeId ? "Node Properties" : "Edge Properties"}
              </h3>

              {selectedNodeId && (
                <>
                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground block mb-2">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateNodeColor(selectedNodeId, color)}
                          className="w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-2">
                      Shape
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateNodeShape(selectedNodeId, "rectangle")
                        }
                        className="flex-1 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md text-sm flex items-center justify-center gap-2"
                      >
                        <div className="w-4 h-4 border-2 border-current" />
                        Rectangle
                      </button>
                      <button
                        onClick={() =>
                          updateNodeShape(selectedNodeId, "circle")
                        }
                        className="flex-1 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md text-sm flex items-center justify-center gap-2"
                      >
                        <div className="w-4 h-4 rounded-full border-2 border-current" />
                        Circle
                      </button>
                    </div>
                  </div>
                </>
              )}

              {selectedEdgeId && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">
                    Line Style
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateEdgeType(selectedEdgeId, "straight")}
                      className="flex-1 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md text-sm flex items-center justify-center gap-2"
                    >
                      <div className="w-4 h-0.5 bg-current" />
                      Straight
                    </button>
                    <button
                      onClick={() => updateEdgeType(selectedEdgeId, "dotted")}
                      className="flex-1 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md text-sm flex items-center justify-center gap-2"
                    >
                      <div className="w-4 h-0.5 bg-current border-t-2 border-dotted" />
                      Dotted
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        )}

        <Panel position="bottom-right" className="mb-4 mr-4">
          <MiniMap
            nodeColor={nodeColor}
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="bg-card! border border-border rounded-md"
          />
        </Panel>
      </ReactFlow>

      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          onClose={() => setContextMenu(null)}
          onAddChild={handleAddChild}
          onAddSibling={handleAddSibling}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onGenerateChildIdeas={handleGenerateChildIdeas}
          onSuggestConcepts={handleSuggestConcepts}
          onExpandSummary={handleExpandSummary}
        />
      )}
      {isGeneratingAI && aiGenerationType && (
        <AILoadingIndicator type={aiGenerationType} />
      )}
    </div>
  );
}

export default Flow;
