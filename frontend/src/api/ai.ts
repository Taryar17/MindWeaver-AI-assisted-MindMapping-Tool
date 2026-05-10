import api from "./index";

export interface AIRequestPayload {
  mindMapId: string;
  nodeId: string;
  action: "generateChildIdeas" | "suggestRelatedConcepts" | "expandSummary";
}

export interface AIResponse {
  result: string | string[];
}

export const aiApi = {
  // Generate AI content
  generateAIContent: async (data: AIRequestPayload) => {
    try {
      const response = await api.post<AIResponse>("users/ai/generate", data);
      return response.data;
    } catch (error) {
      console.error("Failed to generate AI content:", error);
      throw error;
    }
  },

  // Save AI history
  saveAIHistory: async (data: {
    nodeId: string;
    prompt: string;
    response: string;
    model: string;
  }) => {
    try {
      const response = await api.post("users/ai/history", data);
      return response.data;
    } catch (error) {
      console.error("Failed to save AI history:", error);
      throw error;
    }
  },

  // Get AI history for a node
  getNodeAIHistory: async (nodeId: string) => {
    try {
      const response = await api.get(`users/ai/history/${nodeId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to get AI history:", error);
      throw error;
    }
  },
  generateContentFromData: async (data: {
    mapData: {
      nodes: Array<{ id: string; label: string; parentId: string | null }>;
      edges: Array<{ source: string; target: string }>;
    };
    nodeId: string;
    action: "generateChildIdeas" | "suggestRelatedConcepts" | "expandSummary";
  }) => {
    try {
      const response = await api.post<AIResponse>(
        "/users/ai/generate-from-data",
        {
          nodes: data.mapData.nodes,
          edges: data.mapData.edges,
          nodeId: data.nodeId,
          action: data.action,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to generate AI content from data:", error);
      throw error;
    }
  },
};
