import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the AI client
const ai = new GoogleGenAI({
  apiKey: process.env.VERTEX_API_KEY,
  vertexai: true,
});

export interface MindMapData {
  nodes: Array<{
    id: string;
    label: string;
    parentId: string | null;
  }>;
  edges: Array<{
    source: string;
    target: string;
  }>;
}

export interface AIRequestPayload {
  mindMap: MindMapData;
  selectedNodeId: string;
  action: "generateChildIdeas" | "suggestRelatedConcepts" | "expandSummary";
}

export const generateAIContent = async (payload: AIRequestPayload) => {
  const { mindMap, selectedNodeId, action } = payload;

  // Find the selected node
  const selectedNode = mindMap.nodes.find((n) => n.id === selectedNodeId);
  if (!selectedNode) {
    throw new Error("Selected node not found");
  }

  // Build hierarchy for context
  const buildNodeHierarchy = () => {
    const nodeMap = new Map(mindMap.nodes.map((n) => [n.id, n]));
    const getPath = (nodeId: string): string[] => {
      const path: string[] = [];
      let current = nodeMap.get(nodeId);
      while (current) {
        path.unshift(current.label);
        if (!current.parentId) break;
        current = nodeMap.get(current.parentId);
      }
      return path;
    };

    const getChildren = (nodeId: string) => {
      return mindMap.nodes
        .filter((n) => n.parentId === nodeId)
        .map((n) => n.label);
    };

    const getConnections = (nodeId: string) => {
      const connectedNodeIds = mindMap.edges
        .filter((e) => e.source === nodeId || e.target === nodeId)
        .map((e) => (e.source === nodeId ? e.target : e.source));

      return mindMap.nodes
        .filter((n) => connectedNodeIds.includes(n.id))
        .map((n) => n.label);
    };

    return {
      currentNode: selectedNode.label,
      path: getPath(selectedNodeId).join(" > "),
      children: getChildren(selectedNodeId),
      connections: getConnections(selectedNodeId),
    };
  };

  const hierarchy = buildNodeHierarchy();

  // Build the prompt based on action
  const buildPrompt = () => {
    const basePrompt = `
You are given a mind map structure. The current focus is on node "${selectedNode.label}" (ID: ${selectedNodeId}).

Context:
- Full path to node: ${hierarchy.path}
- Current node's children: ${hierarchy.children.join(", ") || "none"}
- Connected nodes: ${hierarchy.connections.join(", ") || "none"}

`;

    switch (action) {
      case "generateChildIdeas":
        return (
          basePrompt +
          `
Task: Generate 5 creative and contextually relevant child nodes for "${selectedNode.label}".

Return ONLY the output in a simple list format, one idea per line.
Do not include explanations or additional text.`
        );

      case "suggestRelatedConcepts":
        return (
          basePrompt +
          `
Task: Suggest 5 related concepts or sibling nodes that could connect to "${selectedNode.label}".

Return ONLY the output in a simple list format, one concept per line.
Do not include explanations or additional text.`
        );

      case "expandSummary":
        return (
          basePrompt +
          `
Task: Expand "${selectedNode.label}" into a comprehensive summary paragraph (2-3 sentences) that explains this concept in detail.

Return ONLY the summary paragraph.
Do not include explanations or additional text.`
        );

      default:
        throw new Error("Unknown action");
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildPrompt(),
    });

    const result = response.text?.trim() || "";

    // Parse the result based on action
    switch (action) {
      case "generateChildIdeas":
      case "suggestRelatedConcepts":
        // Split by newlines and filter empty lines
        return result
          .split("\n")
          .map((line) => line.trim())
          .filter(
            (line) => line && !line.startsWith("-") && !line.startsWith("*"),
          )
          .slice(0, 5); // Ensure we only get 5 items

      case "expandSummary":
        return result;

      default:
        return result;
    }
  } catch (error) {
    console.error("AI generation failed:", error);
    throw error;
  }
};
