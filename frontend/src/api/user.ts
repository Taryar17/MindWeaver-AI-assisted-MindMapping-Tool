import api from "./index";

export interface UserProfile {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
  lastLogin: string | null;
}

export interface UserStats {
  totalMindMaps: number;
  totalNodes: number;
  totalEdges: number;
  totalExportedNotes: number;
}

export const userApi = {
  getProfile: async () => {
    try {
      const response = await api.get<UserProfile>("/users/profile");
      return response.data;
    } catch (error) {
      console.error("Failed to get user profile:", error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get<UserStats>("/users/profile/stats");
      return response.data;
    } catch (error) {
      console.error("Failed to get user stats:", error);
      throw error;
    }
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => {
    try {
      const response = await api.put<UserProfile>("/users/profile", data);
      return response.data;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const response = await api.patch(
        "/users/profile/upload/optimize",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      throw error;
    }
  },
};
