import api from "./index";

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const passwordApi = {
  // Request password reset (forgot password)
  forgotPassword: async (data: ForgotPasswordData) => {
    try {
      const response = await api.post("/forget-password", data);
      return response.data;
    } catch (error) {
      console.error("Failed to send reset email:", error);
      throw error;
    }
  },

  // Reset password with token
  resetPassword: async (data: ResetPasswordData) => {
    try {
      const response = await api.post("/reset-password", data);
      return response.data;
    } catch (error) {
      console.error("Failed to reset password:", error);
      throw error;
    }
  },

  // Change password while logged in
  changePassword: async (data: ChangePasswordData) => {
    try {
      const response = await api.post("/change-password", data);
      return response.data;
    } catch (error) {
      console.error("Failed to change password:", error);
      throw error;
    }
  },
};
