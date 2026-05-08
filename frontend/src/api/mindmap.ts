import api from "./index";
import type { Node, Edge } from "@xyflow/react";

export interface SaveMindMapData {
  id?: string;
  title: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  isPublic?: boolean;
}

export interface MindMapResponse {
  id: string;
  title: string;
  description: string | null;
  nodes: Node[];
  edges: Edge[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: number;
}

export const mindmapApi = {
  // Save a new mind map or update existing one
  saveMindMap: async (data: SaveMindMapData) => {
    try {
      const response = await api.post<MindMapResponse>("/users/mindmaps", data);
      return response.data;
    } catch (error) {
      console.error("Failed to save mind map:", error);
      throw error;
    }
  },

  // Update an existing mind map
  updateMindMap: async (id: string, data: Partial<SaveMindMapData>) => {
    try {
      const response = await api.put<MindMapResponse>(
        `/users/mindmaps/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update mind map:", error);
      throw error;
    }
  },

  // Load a mind map by ID
  loadMindMap: async (id: string) => {
    try {
      const response = await api.get<MindMapResponse>(`/users/mindmaps/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to load mind map:", error);
      throw error;
    }
  },

  // Get all mind maps for the current user
  getUserMindMaps: async () => {
    try {
      const response = await api.get<MindMapResponse[]>("/users/mindmaps/user");
      return response.data;
    } catch (error) {
      console.error("Failed to load user mind maps:", error);
      throw error;
    }
  },

  // Delete a mind map
  deleteMindMap: async (id: string) => {
    try {
      await api.delete(`/users/mindmaps/${id}`);
    } catch (error) {
      console.error("Failed to delete mind map:", error);
      throw error;
    }
  },
};
