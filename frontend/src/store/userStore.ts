import { create } from "zustand";
import { userApi, type UserProfile, type UserStats } from "@/api/user";

interface UserState {
  profile: UserProfile | null;
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  loadStats: () => Promise<void>;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  stats: null,
  isLoading: false,
  error: null,

  loadProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await userApi.getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      set({ error: "Failed to load profile", isLoading: false });
      console.error("Failed to load profile:", error);
    }
  },

  loadStats: async () => {
    try {
      const stats = await userApi.getStats();
      set({ stats });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await userApi.updateProfile(data);
      set((state) => ({
        profile: state.profile ? { ...state.profile, ...updated } : updated,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to update profile", isLoading: false });
      throw error;
    }
  },

  uploadAvatar: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.uploadAvatar(file);
      await get().loadProfile(); // Refresh profile after upload
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: "Failed to upload avatar", isLoading: false });
      throw error;
    }
  },

  clearUser: () => {
    set({ profile: null, stats: null, error: null });
  },
}));
