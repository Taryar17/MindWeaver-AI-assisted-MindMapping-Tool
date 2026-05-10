import {
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  type XYPosition,
} from "@xyflow/react";
import { createWithEqualityFn } from "zustand/traditional";
import { nanoid } from "nanoid/non-secure";
import { mindmapApi } from "@/api/mindmap";
import { aiApi } from "@/api/ai";

export type RFState = {
  nodes: Node[];
  edges: Edge[];
  isGeneratingAI: boolean;
  aiGenerationType:
    | "generateChildIdeas"
    | "suggestRelatedConcepts"
    | "expandSummary"
    | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addChildNode: (parentNode: Node, position: XYPosition) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeColor: (nodeId: string, color: string) => void;
  updateNodeShape: (nodeId: string, shape: "rectangle" | "circle") => void;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;
  deleteEdge: (edgeId: string) => void;
  mindMapId: string | null;
  mindMapTitle: string;
  mindMapDescription: string;
  setMindMapId: (id: string | null) => void;
  setMindMapTitle: (title: string) => void;
  setMindMapDescription: (description: string) => void;
  saveMindMap: () => Promise<void>;
  loadMindMap: (id: string) => Promise<void>;
  setNodes: (nodes: Node[]) => void;
  resetToNewMindMap: () => void;
  history: Node[][];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushToHistory: (newNodes: Node[], newEdges: Edge[]) => void;
  setCanUndoRedo: () => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  exportMindmap: (
    format: "png" | "jpeg" | "svg",
    filename: string,
  ) => Promise<void>;

  // AI Action related functions
  getSurroundingNodes: (nodeId: string) => {
    parent: Node | null;
    children: Node[];
    siblings: Node[];
    connectedNodes: Node[];
  };
  generateChildIdeas: (nodeId: string) => Promise<void>;
  suggestRelatedConcepts: (nodeId: string) => Promise<void>;
  expandIntoSummary: (nodeId: string) => Promise<void>;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
};
const AI_COLORS = {
  generateChildIdeas: "#06d6a0", // Mint green
  suggestRelatedConcepts: "#ffd166", // Warm yellow
  expandSummary: "#118ab2", // Ocean blue
};
const useStore = createWithEqualityFn<RFState>((set, get) => ({
  nodes: [
    {
      id: nanoid(),
      type: "mindmap",
      data: {
        label: "Main Node",
        color: "#ffffff",
        shape: "rectangle",
      },
      position: { x: 400, y: 300 },
    },
  ],
  edges: [],

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  addChildNode: (parentNode: Node, position: XYPosition) => {
    // Push to history BEFORE making changes
    get().pushToHistory(get().nodes, get().edges);
    const newNode = {
      id: nanoid(),
      type: "mindmap",
      data: { label: "New Node", color: "#ffffff", shape: "rectangle" },
      position,
      parentId: parentNode.id,
    };

    const newEdge = {
      id: nanoid(),
      source: parentNode.id,
      target: newNode.id,
      data: {
        edgeType: "straight",
      },
    };

    set({
      nodes: [...get().nodes, newNode],
      edges: [...get().edges, newEdge],
    });

    setTimeout(() => {
      get().setSelectedNode(newNode.id);
    }, 100);
    set({ hasUnsavedChanges: true });
  },
  deleteEdge: (edgeId: string) => {
    // Push to history BEFORE making changes
    get().pushToHistory(get().nodes, get().edges);
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
    }));
    if (get().selectedEdgeId === edgeId) {
      get().setSelectedEdge(null);
    }
    set({ hasUnsavedChanges: true });
  },

  deleteNode: (nodeId: string) => {
    // Push to history BEFORE making changes
    get().pushToHistory(get().nodes, get().edges);
    // Remove all edges connected to this node
    const edgesToRemove = get().edges.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId,
    );

    // Find and remove child nodes
    const nodesToRemove = [nodeId];
    const findChildNodes = (parentId: string) => {
      get().nodes.forEach((node) => {
        if (node.parentId === parentId && !nodesToRemove.includes(node.id)) {
          nodesToRemove.push(node.id);
          findChildNodes(node.id);
        }
      });
    };
    findChildNodes(nodeId);

    set({
      nodes: get().nodes.filter((node) => !nodesToRemove.includes(node.id)),
      edges: get().edges.filter(
        (edge) => !edgesToRemove.some((e) => e.id === edge.id),
      ),
    });

    if (get().selectedNodeId === nodeId) {
      get().setSelectedNode(null);
    }
    set({ hasUnsavedChanges: true });
  },

  updateNodeLabel: (nodeId: string, label: string) => {
    // Push to history BEFORE making changes
    get().pushToHistory(get().nodes, get().edges);
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, label } } : node,
      ),
    }));
    set({ hasUnsavedChanges: true });
  },

  updateNodeColor: (nodeId, color) => {
    // Push to history BEFORE making changes
    get().pushToHistory(get().nodes, get().edges);
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, color } } : node,
      ),
    }));
    set({ hasUnsavedChanges: true });
  },

  updateNodeShape: (nodeId, shape) => {
    // Push to history BEFORE making changes
    get().pushToHistory(get().nodes, get().edges);
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, shape } } : node,
      ),
    }));
    set({ hasUnsavedChanges: true });
  },
  selectedNodeId: null,
  selectedEdgeId: null,

  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id }),

  // Helper function to get surrounding nodes
  getSurroundingNodes: (nodeId: string) => {
    const nodes = get().nodes;
    const edges = get().edges;
    const currentNode = nodes.find((n) => n.id === nodeId);

    if (!currentNode) {
      return { parent: null, children: [], siblings: [], connectedNodes: [] };
    }

    // Find parent
    const parent = nodes.find((n) => n.id === currentNode.parentId) || null;

    const children = nodes.filter((n) => n.parentId === nodeId);

    const siblings = currentNode.parentId
      ? nodes.filter(
          (n) => n.parentId === currentNode.parentId && n.id !== nodeId,
        )
      : [];

    const connectedNodeIds = edges
      .filter((e) => e.source === nodeId || e.target === nodeId)
      .map((e) => (e.source === nodeId ? e.target : e.source));

    const connectedNodes = nodes.filter((n) => connectedNodeIds.includes(n.id));

    return { parent, children, siblings, connectedNodes };
  },
  isGeneratingAI: false,
  aiGenerationType: null,

  // AI Action: Generate Child Ideas
  generateChildIdeas: async (nodeId: string) => {
    const { mindMapId, nodes, edges } = get();
    const currentNode = get().nodes.find((n) => n.id === nodeId);

    if (!currentNode) {
      console.error("No current node");
      return;
    }

    // Set loading state
    set({ isGeneratingAI: true, aiGenerationType: "generateChildIdeas" });

    try {
      console.log("Generating child ideas...");

      let response;
      if (!mindMapId) {
        // Send current map data directly to AI
        const mapData = {
          nodes: nodes.map((n) => ({
            id: n.id,
            label: n.data.label,
            parentId: n.parentId || null,
          })),
          edges: edges.map((e) => ({
            source: e.source,
            target: e.target,
          })),
        };
        response = await aiApi.generateContentFromData({
          mapData,
          nodeId,
          action: "generateChildIdeas",
        });
      } else {
        response = await aiApi.generateAIContent({
          mindMapId,
          nodeId,
          action: "generateChildIdeas",
        });
      }

      if (response.result && Array.isArray(response.result)) {
        const ideas = response.result as string[];

        // Add new child nodes at offset positions with AI color
        ideas.forEach((idea, index) => {
          const position = {
            x: currentNode.position.x + 250 + index * 30,
            y: currentNode.position.y + 150 + index * 20,
          };

          // Create node with AI-specific color
          const newNode = {
            id: nanoid(),
            type: "mindmap",
            data: {
              label: idea,
              color: AI_COLORS.generateChildIdeas,
              shape: "rectangle",
              aiGenerated: true,
            },
            position,
            parentId: currentNode.id,
          };

          const newEdge = {
            id: nanoid(),
            source: currentNode.id,
            target: newNode.id,
            data: {
              edgeType: "straight",
            },
          };

          set((state) => ({
            nodes: [...state.nodes, newNode],
            edges: [...state.edges, newEdge],
          }));
        });

        console.log("Child ideas generated successfully!");
      }
    } catch (error) {
      console.error("Failed to generate child ideas:", error);
    } finally {
      // Clear loading state
      set({ isGeneratingAI: false, aiGenerationType: null });
    }
  },

  // AI Action: Suggest Related Concepts
  suggestRelatedConcepts: async (nodeId: string) => {
    const { mindMapId, nodes, edges } = get();
    const currentNode = get().nodes.find((n) => n.id === nodeId);

    if (!currentNode) {
      console.error("No current node");
      return;
    }

    // Set loading state
    set({ isGeneratingAI: true, aiGenerationType: "suggestRelatedConcepts" });

    try {
      console.log("Suggesting related concepts...");

      let response;
      if (!mindMapId) {
        // Send current map data directly to AI
        const mapData = {
          nodes: nodes.map((n) => ({
            id: n.id,
            label: n.data.label,
            parentId: n.parentId || null,
          })),
          edges: edges.map((e) => ({
            source: e.source,
            target: e.target,
          })),
        };
        response = await aiApi.generateContentFromData({
          mapData,
          nodeId,
          action: "suggestRelatedConcepts",
        });
      } else {
        response = await aiApi.generateAIContent({
          mindMapId,
          nodeId,
          action: "suggestRelatedConcepts",
        });
      }

      if (response.result && Array.isArray(response.result)) {
        const concepts = response.result as string[];

        // Add as sibling nodes with AI color
        concepts.forEach((concept, index) => {
          const position = {
            x: currentNode.position.x + 300 + index * 40,
            y: currentNode.position.y - 120,
          };

          // Create node with AI-specific color
          const newNode = {
            id: nanoid(),
            type: "mindmap",
            data: {
              label: concept,
              color: AI_COLORS.suggestRelatedConcepts,
              shape: "rectangle",
              aiGenerated: true,
            },
            position,
            parentId: currentNode.parentId,
          };

          // Only add edge if parent exists
          if (currentNode.parentId) {
            const newEdge = {
              id: nanoid(),
              source: currentNode.parentId,
              target: newNode.id,
              data: {
                edgeType: "straight",
              },
            };

            set((state) => ({
              nodes: [...state.nodes, newNode],
              edges: [...state.edges, newEdge],
            }));
          } else {
            // If no parent, just add the node (floating concept)
            set((state) => ({
              nodes: [...state.nodes, newNode],
            }));
          }
        });

        console.log("Related concepts generated successfully!");
      }
    } catch (error) {
      console.error("Failed to suggest related concepts:", error);
    } finally {
      // Clear loading state
      set({ isGeneratingAI: false, aiGenerationType: null });
    }
  },

  setEdges: (edges) => {
    // Push to history BEFORE making changes
    get().pushToHistory(get().nodes, get().edges);
    set((state) => ({
      edges: typeof edges === "function" ? edges(state.edges) : edges,
    }));
    set({ hasUnsavedChanges: true });
  },

  // AI Action: Expand into Summary
  expandIntoSummary: async (nodeId: string) => {
    const { mindMapId, nodes, edges } = get();
    const currentNode = get().nodes.find((n) => n.id === nodeId);

    if (!currentNode) {
      console.error("No current node");
      return;
    }

    // Set loading state
    set({ isGeneratingAI: true, aiGenerationType: "expandSummary" });

    try {
      console.log("Expanding into summary...");

      let response;
      if (!mindMapId) {
        // Send current map data directly to AI
        const mapData = {
          nodes: nodes.map((n) => ({
            id: n.id,
            label: n.data.label,
            parentId: n.parentId || null,
          })),
          edges: edges.map((e) => ({
            source: e.source,
            target: e.target,
          })),
        };
        response = await aiApi.generateContentFromData({
          mapData,
          nodeId,
          action: "expandSummary",
        });
      } else {
        response = await aiApi.generateAIContent({
          mindMapId,
          nodeId,
          action: "expandSummary",
        });
      }

      if (response.result && typeof response.result === "string") {
        // Create a special summary node with larger dimensions
        const position = {
          x: currentNode.position.x + 300,
          y: currentNode.position.y - 150,
        };

        // Create summary node - special type for larger display
        const summaryNode = {
          id: nanoid(),
          type: "mindmap",
          data: {
            label: response.result as string,
            color: AI_COLORS.expandSummary,
            shape: "rectangle",
            aiGenerated: true,
            nodeType: "SUMMARY",
          },
          position,
          parentId: currentNode.id, // Connect to parent
        };

        const newEdge = {
          id: nanoid(),
          source: currentNode.id,
          target: summaryNode.id,
          data: {
            edgeType: "straight",
          },
        };

        set((state) => ({
          nodes: [...state.nodes, summaryNode],
          edges: [...state.edges, newEdge],
        }));

        console.log("Summary expanded successfully!");
      }
    } catch (error) {
      console.error("Failed to expand summary:", error);
    } finally {
      // Clear loading state
      set({ isGeneratingAI: false, aiGenerationType: null });
    }
  },
  mindMapId: null,
  mindMapTitle: "untitled project",
  mindMapDescription: "",
  setMindMapId: (id) => set({ mindMapId: id }),
  setMindMapTitle: (title) => set({ mindMapTitle: title }),
  setMindMapDescription: (description) =>
    set({ mindMapDescription: description }),

  saveMindMap: async () => {
    const { nodes, edges, mindMapId, mindMapTitle, mindMapDescription } = get();

    try {
      // Validate that we have nodes to save
      if (!nodes || nodes.length === 0) {
        console.error("No nodes to save");
        return;
      }

      const saveData = {
        id: mindMapId || undefined,
        title: mindMapTitle,
        description: mindMapDescription,
        nodes: nodes.map((node) => ({
          id: node.id,
          data: node.data,
          position: node.position,
          parentId: node.parentId,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          data: edge.data,
        })),
      };

      console.log("Saving mind map with data:", saveData); // Add this for debugging

      let response;
      if (mindMapId) {
        response = await mindmapApi.updateMindMap(mindMapId, saveData);
      } else {
        response = await mindmapApi.saveMindMap(saveData);
      }

      if (response) {
        set({ mindMapId: response.id, hasUnsavedChanges: false });

        console.log("Mind map saved successfully!", response);

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error("Failed to save mind map:", error);
      throw error;
    }
  },
  resetToNewMindMap: () => {
    set({
      nodes: [
        {
          id: nanoid(),
          type: "mindmap",
          data: {
            label: "Main Node",
            color: "#ffffff",
            shape: "rectangle",
          },
          position: { x: 400, y: 300 },
        },
      ],
      edges: [],
      mindMapId: null,
      mindMapTitle: "untitled project",
      mindMapDescription: "",
      selectedNodeId: null,
      selectedEdgeId: null,
      hasUnsavedChanges: false,
    });
  },

  loadMindMap: async (id: string) => {
    try {
      const mindMap = await mindmapApi.loadMindMap(id);

      set({
        nodes: mindMap.nodes,
        edges: mindMap.edges,
        mindMapId: mindMap.id,
        mindMapTitle: mindMap.title,
        mindMapDescription: mindMap.description || "",
        hasUnsavedChanges: false,
      });
    } catch (error) {
      console.error("Failed to load mind map:", error);
    }
  },
  setNodes: (nodes: Node[]) => set({ nodes }),
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  setCanUndoRedo: () => {
    set((state) => ({
      canUndo: state.historyIndex > 0,
      canRedo: state.historyIndex < state.history.length - 1,
    }));
  },

  pushToHistory: (newNodes: Node[], newEdges: Edge[]) => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ nodes: [...newNodes], edges: [...newEdges] });
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    get().setCanUndoRedo();
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      const snapshot = state.history[newIndex];
      return {
        historyIndex: newIndex,
        nodes: snapshot.nodes,
        edges: snapshot.edges,
      };
    });
    get().setCanUndoRedo();
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      const snapshot = state.history[newIndex];
      return {
        historyIndex: newIndex,
        nodes: snapshot.nodes,
        edges: snapshot.edges,
      };
    });
    get().setCanUndoRedo();
  },
  hasUnsavedChanges: false,
  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
  exportMindmap: async () => {},
}));

export default useStore;
