import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { passwordApi } from "@/api/password";
import { toast } from "sonner";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.current = "Current password is required";
    }

    if (!newPassword) {
      newErrors.new = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.new = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirm = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirm = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      await passwordApi.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
      onClose();
      resetForm();
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to change password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Change Password
          </h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-md bg-background border border-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.current && (
              <p className="text-xs text-destructive mt-1">{errors.current}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md bg-background border border-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.new && (
              <p className="text-xs text-destructive mt-1">{errors.new}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md bg-background border border-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm && (
              <p className="text-xs text-destructive mt-1">{errors.confirm}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 px-4 py-2 border border-border rounded-md text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
