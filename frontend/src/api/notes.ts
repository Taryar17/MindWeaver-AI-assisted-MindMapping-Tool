import api from "./index";

export interface ExportedNote {
  id: string;
  title: string;
  content: string;
  format: string;
  mindMapId: string;
  mindMap?: {
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GenerateNoteRequest {
  mindMapId: string;
}

export interface GenerateNoteResponse {
  content: string;
}

export interface SaveNoteRequest {
  mindMapId: string;
  title: string;
  content: string;
  format?: string;
}

export const notesApi = {
  // Generate a note from a mind map
  generateNote: async (data: GenerateNoteRequest) => {
    try {
      const response = await api.post<GenerateNoteResponse>(
        "users/notes/generate",
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to generate note:", error);
      throw error;
    }
  },

  // Save an exported note
  saveNote: async (data: SaveNoteRequest) => {
    try {
      const response = await api.post<ExportedNote>("users/notes", data);
      return response.data;
    } catch (error) {
      console.error("Failed to save note:", error);
      throw error;
    }
  },

  // Get all exported notes for the user
  getUserNotes: async () => {
    try {
      const response = await api.get<ExportedNote[]>("users/notes/user");
      return response.data;
    } catch (error) {
      console.error("Failed to get notes:", error);
      throw error;
    }
  },

  // Get a single exported note
  getNote: async (id: string) => {
    try {
      const response = await api.get<ExportedNote>(`users/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to get note:", error);
      throw error;
    }
  },

  // Delete an exported note
  deleteNote: async (id: string) => {
    try {
      await api.delete(`users/notes/${id}`);
    } catch (error) {
      console.error("Failed to delete note:", error);
      throw error;
    }
  },
};
