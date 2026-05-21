import {
  type Edge,
  type Node,
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
  history: {
    nodes: Node[];
    edges: Edge[];
  }[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushToHistory: (newNodes: Node[], newEdges: Edge[]) => void;
  isRestoringHistory: boolean;
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

  onNodesChange: (changes) => {
    const { nodes, edges, isRestoringHistory } = get();

    const updatedNodes = applyNodeChanges(changes, nodes);

    set({ nodes: updatedNodes });

    if (isRestoringHistory) return;

    const meaningfulChange = changes.some(
      (c) =>
        c.type === "add" ||
        c.type === "remove" ||
        (c.type === "position" && c.dragging === false),
    );

    if (meaningfulChange) {
      get().pushToHistory(updatedNodes, edges);
    }
  },
  onEdgesChange: (changes) => {
    const { nodes, edges, isRestoringHistory } = get();

    const updatedEdges = applyEdgeChanges(changes, edges);

    set({ edges: updatedEdges });

    if (isRestoringHistory) return;

    const meaningfulChange = changes.some(
      (c) => c.type === "add" || c.type === "remove",
    );

    if (meaningfulChange) {
      get().pushToHistory(nodes, updatedEdges);
    }
  },

  addChildNode: (parentNode: Node, position: XYPosition) => {
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

    const nodes = [...get().nodes, newNode];
    const edges = [...get().edges, newEdge];

    set({ nodes, edges });

    get().pushToHistory(nodes, edges);

    setTimeout(() => {
      get().setSelectedNode(newNode.id);
    }, 100);
    set({ hasUnsavedChanges: true });
  },
  deleteEdge: (edgeId) => {
    const edges = get().edges.filter((e) => e.id !== edgeId);

    set({ edges });

    get().pushToHistory(get().nodes, edges);

    set({ hasUnsavedChanges: true });
  },

  deleteNode: (nodeId: string) => {
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

    const nodes = get().nodes.filter(
      (node) => !nodesToRemove.includes(node.id),
    );
    const edges = get().edges.filter(
      (edge) => !edgesToRemove.some((e) => e.id === edge.id),
    );
    set({ nodes, edges });

    get().pushToHistory(nodes, edges);

    if (get().selectedNodeId === nodeId) {
      get().setSelectedNode(null);
    }
    set({ hasUnsavedChanges: true });
  },

  updateNodeLabel: (nodeId: string, label: string) => {
    const nodes = get().nodes.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, label } } : node,
    );
    set({ nodes });
    get().pushToHistory(nodes, get().edges);
    set({ hasUnsavedChanges: true });
  },

  updateNodeColor: (nodeId, color) => {
    const nodes = get().nodes.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, color } } : node,
    );
    set({ nodes });
    get().pushToHistory(nodes, get().edges);
    set({ hasUnsavedChanges: true });
  },
  updateNodeShape: (nodeId, shape) => {
    const nodes = get().nodes.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, shape } } : node,
    );
    set({ nodes });
    get().pushToHistory(nodes, get().edges);
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
    const currentNode = nodes.find((n) => n.id === nodeId);

    if (!currentNode) return;

    set({ isGeneratingAI: true, aiGenerationType: "generateChildIdeas" });

    try {
      let response;

      if (!mindMapId) {
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

        const newNodes: AINode[] = [];
        const newEdges: AIEdge[] = [];

        ideas.forEach((idea, index) => {
          const spacingY = 140;
          const startY =
            currentNode.position.y - ((ideas.length - 1) * spacingY) / 2;

          const node = {
            id: nanoid(),
            type: "mindmap",
            data: {
              label: idea,
              color: AI_COLORS.generateChildIdeas,
              shape: "rectangle",
              aiGenerated: true,
            },
            position: {
              x: currentNode.position.x + 350,
              y: startY + index * spacingY,
            },
            parentId: currentNode.id,
          };

          const edge = {
            id: nanoid(),
            source: currentNode.id,
            target: node.id,
            data: { edgeType: "straight" },
          };

          newNodes.push(node);
          newEdges.push(edge);
        });

        const updatedNodes = [...get().nodes, ...newNodes];
        const updatedEdges = [...get().edges, ...newEdges];

        set({ nodes: updatedNodes, edges: updatedEdges });

        get().pushToHistory(updatedNodes, updatedEdges);
      }
    } finally {
      set({ isGeneratingAI: false, aiGenerationType: null });
    }
  },

  // AI Action: Suggest Related Concepts
  suggestRelatedConcepts: async (nodeId: string) => {
    const { mindMapId, nodes, edges } = get();
    const currentNode = nodes.find((n) => n.id === nodeId);

    if (!currentNode) return;

    set({ isGeneratingAI: true, aiGenerationType: "suggestRelatedConcepts" });

    try {
      let response;

      if (!mindMapId) {
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

        const newNodes: any = [];
        const newEdges: any = [];

        concepts.forEach((concept, index) => {
          const spacingX = 220;
          const startX =
            currentNode.position.x - ((concepts.length - 1) * spacingX) / 2;

          const node = {
            id: nanoid(),
            type: "mindmap",
            data: {
              label: concept,
              color: AI_COLORS.suggestRelatedConcepts,
              shape: "rectangle",
              aiGenerated: true,
            },
            position: {
              x: startX + index * spacingX,
              y: currentNode.position.y - 60,
            },
            parentId: currentNode.parentId,
          };

          newNodes.push(node);

          if (currentNode.parentId) {
            newEdges.push({
              id: nanoid(),
              source: currentNode.parentId,
              target: node.id,
              data: { edgeType: "straight" },
            });
          }
        });

        const updatedNodes = [...get().nodes, ...newNodes];
        const updatedEdges = [...get().edges, ...newEdges];

        set({ nodes: updatedNodes, edges: updatedEdges });

        get().pushToHistory(updatedNodes, updatedEdges);
      }
    } finally {
      set({ isGeneratingAI: false, aiGenerationType: null });
    }
  },

  setEdges: (edges) => {
    const newEdges = typeof edges === "function" ? edges(get().edges) : edges;

    set({ edges: newEdges });

    get().pushToHistory(get().nodes, newEdges);

    set({ hasUnsavedChanges: true });
  },

  // AI Action: Expand into Summary
  expandIntoSummary: async (nodeId: string) => {
    const { mindMapId, nodes, edges } = get();
    const currentNode = nodes.find((n) => n.id === nodeId);

    if (!currentNode) return;

    set({ isGeneratingAI: true, aiGenerationType: "expandSummary" });

    try {
      let response;

      if (!mindMapId) {
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

      if (typeof response.result === "string") {
        const summaryNode = {
          id: nanoid(),
          type: "mindmap",
          data: {
            label: response.result,
            color: AI_COLORS.expandSummary,
            shape: "rectangle",
            aiGenerated: true,
            nodeType: "SUMMARY",
          },
          position: {
            x: currentNode.position.x + 300,
            y: currentNode.position.y - 150,
          },
          parentId: currentNode.id,
        };

        const edge = {
          id: nanoid(),
          source: currentNode.id,
          target: summaryNode.id,
          data: { edgeType: "straight" },
        };

        const updatedNodes = [...get().nodes, summaryNode];
        const updatedEdges = [...get().edges, edge];

        set({ nodes: updatedNodes, edges: updatedEdges });

        get().pushToHistory(updatedNodes, updatedEdges);
      }
    } finally {
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

      console.log("Saving mind map with data:", saveData);

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
    const newNodes = [
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
    ];
    const newEdges: Edge[] = [];

    set({
      nodes: newNodes,
      edges: newEdges,
      mindMapId: null,
      mindMapTitle: "untitled project",
      mindMapDescription: "",
      selectedNodeId: null,
      selectedEdgeId: null,
      hasUnsavedChanges: false,
    });

    set({
      nodes: newNodes,
      edges: newEdges,
      history: [{ nodes: structuredClone(newNodes), edges: [] }],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
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

      set({
        nodes: mindMap.nodes,
        edges: mindMap.edges,
        history: [
          {
            nodes: structuredClone(mindMap.nodes),
            edges: structuredClone(mindMap.edges),
          },
        ],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
      });
    } catch (error) {
      console.error("Failed to load mind map:", error);
    }
  },
  setNodes: (nodes) => {
    set({ nodes });
    get().pushToHistory(nodes, get().edges);
  },
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

  pushToHistory: (nodes, edges) => {
    const state = get();

    if (state.isRestoringHistory) return;

    const last = state.history[state.historyIndex];

    // Prevent duplicate snapshots
    if (
      last &&
      JSON.stringify(last.nodes) === JSON.stringify(nodes) &&
      JSON.stringify(last.edges) === JSON.stringify(edges)
    ) {
      return;
    }

    const newHistory = state.history.slice(0, state.historyIndex + 1);

    newHistory.push({
      nodes: structuredClone(nodes),
      edges: structuredClone(edges),
    });

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
    });
  },

  undo: () => {
    if (get().historyIndex <= 0) return;

    const newIndex = get().historyIndex - 1;
    const snapshot = get().history[newIndex];

    if (snapshot) {
      set({
        isRestoringHistory: true,
        nodes: structuredClone(snapshot.nodes),
        edges: structuredClone(snapshot.edges),
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
      });

      setTimeout(() => set({ isRestoringHistory: false }), 0);
    }
  },

  redo: () => {
    if (get().historyIndex >= get().history.length - 1) return;

    const newIndex = get().historyIndex + 1;
    const snapshot = get().history[newIndex];

    if (snapshot) {
      set({
        isRestoringHistory: true,
        nodes: structuredClone(snapshot.nodes),
        edges: structuredClone(snapshot.edges),
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < get().history.length - 1,
      });

      setTimeout(() => set({ isRestoringHistory: false }), 0);
    }
  },
  isRestoringHistory: false,
  hasUnsavedChanges: false,
  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
  exportMindmap: async () => {},
}));

export default useStore;
