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
import { toPng, toJpeg, toSvg } from "html-to-image";

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  setEdges: state.setEdges,
  addChildNode: state.addChildNode,
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
  isGeneratingAI: state.isGeneratingAI,
  aiGenerationType: state.aiGenerationType,
  undo: state.undo,
  redo: state.redo,
  canUndo: state.canUndo,
  canRedo: state.canRedo,
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
    deleteNode,
    deleteEdge,
    generateChildIdeas,
    suggestRelatedConcepts,
    expandIntoSummary,
    selectedEdgeId,
    selectedNodeId,
    setSelectedEdge,
    setSelectedNode,
    updateNodeColor,
    updateNodeShape,
    isGeneratingAI,
    aiGenerationType,
  } = useStore(selector, shallow);

  const { screenToFlowPosition, getZoom, fitView, getViewport, setViewport } =
    useReactFlow();
  const [zoom, setZoom] = useState(100);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);

  const exportMindmap = useCallback(
    async (format: "png" | "jpeg" | "svg", filename: string) => {
      const reactFlowEl = document.querySelector(
        ".react-flow__renderer",
      ) as HTMLElement;

      if (!reactFlowEl) return;
      reactFlowEl.classList.add("exporting");

      /*Save current viewport*/
      const currentViewport = getViewport();

      /*Fit entire diagram*/
      await fitView({
        padding: 0.2,
        duration: 300,
      });

      await new Promise((r) => setTimeout(r, 350));

      /* Fix edge visibility - force all SVG paths to have explicit colors */
      const allEdges = reactFlowEl.querySelectorAll(".react-flow__edge-path");
      const originalStrokes: string[] = [];

      allEdges.forEach((edge, index) => {
        const path = edge as SVGPathElement;
        originalStrokes[index] = path.getAttribute("stroke") || "";
        // Force explicit stroke color
        const isSelected = path
          .closest(".react-flow__edge")
          ?.classList.contains("selected");
        path.setAttribute("stroke", isSelected ? "#06b6d4" : "#94a3b8");
        path.setAttribute("stroke-width", isSelected ? "3" : "1.5");
      });

      /*Also ensure all nodes have proper styling*/
      const allNodes = reactFlowEl.querySelectorAll(".react-flow__node");
      const originalBackgrounds: string[] = [];

      allNodes.forEach((node, index) => {
        const div = node as HTMLElement;
        originalBackgrounds[index] = div.style.backgroundColor;
        if (
          div.style.backgroundColor === "" ||
          div.style.backgroundColor === "var(--card)"
        ) {
          const computedBg = window.getComputedStyle(div).backgroundColor;
          if (computedBg !== "rgba(0, 0, 0, 0)") {
            div.style.backgroundColor = computedBg;
          }
        }
      });

      /*Export with proper background*/
      const options = {
        backgroundColor:
          getComputedStyle(document.body)
            .getPropertyValue("--background")
            .trim() || "#ffffff",
        pixelRatio: 3,
        cacheBust: true,
      };

      let dataUrl: string;

      try {
        if (format === "jpeg") {
          dataUrl = await toJpeg(reactFlowEl, {
            ...options,
            quality: 0.95,
          });
        } else if (format === "svg") {
          dataUrl = await toSvg(reactFlowEl, options);
        } else {
          dataUrl = await toPng(reactFlowEl, options);
        }
      } finally {
        // Restore original edge strokes
        allEdges.forEach((edge, index) => {
          const path = edge as SVGPathElement;
          if (originalStrokes[index]) {
            path.setAttribute("stroke", originalStrokes[index]);
          } else {
            path.removeAttribute("stroke");
          }
        });

        // Restore original node backgrounds
        allNodes.forEach((node, index) => {
          const div = node as HTMLElement;
          if (originalBackgrounds[index]) {
            div.style.backgroundColor = originalBackgrounds[index];
          } else {
            div.style.backgroundColor = "";
          }
        });

        // Remove temporary class
        reactFlowEl.classList.remove("exporting");
      }

      /*Restore viewport*/
      await setViewport(currentViewport, { duration: 0 });

      /* Download*/
      const link = document.createElement("a");
      link.download = `${filename}.${format}`;
      link.href = dataUrl;
      link.click();
    },
    [fitView, getViewport, setViewport],
  );

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

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleUndoRedo = (event: KeyboardEvent) => {
      // Check if Cmd (Mac) or Ctrl (Windows) is pressed
      const isModifierPressed = event.metaKey || event.ctrlKey;

      if (isModifierPressed) {
        // Undo: Ctrl+Z or Cmd+Z
        if (event.key === "z" && !event.shiftKey) {
          event.preventDefault();
          const { undo } = useStore.getState();
          undo();
        }
        // Redo: Ctrl+Y or Cmd+Y OR Ctrl+Shift+Z
        else if (event.key === "y" || (event.key === "z" && event.shiftKey)) {
          event.preventDefault();
          const { redo } = useStore.getState();
          redo();
        }
      }
    };

    document.addEventListener("keydown", handleUndoRedo);
    return () => {
      document.removeEventListener("keydown", handleUndoRedo);
    };
  }, []);

  useEffect(() => {
    useStore.setState({
      exportMindmap,
    });
  }, [exportMindmap]);

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

        {selectedNodeId && (
          <Panel position="top-left" className="mt-16 mr-4">
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 w-64">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Node Properties
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
