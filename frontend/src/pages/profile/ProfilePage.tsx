import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import { ChangePasswordModal } from "@/components/util/ChangePasswordModal";

function ProfilePage() {
  const navigate = useNavigate();
  const {
    profile,
    stats,
    loadProfile,
    loadStats,
    updateProfile,
    uploadAvatar,
    isLoading,
  } = useUserStore();

  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    setUploading(true);

    try {
      await uploadAvatar(file);
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      toast.error("Failed to upload profile picture");
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.log(error);
    }
  };

  const getInitials = () => {
    if (!profile) return "U";
    const first = profile.firstName?.[0] || "";
    const last = profile.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const getAvatarUrl = () => {
    if (preview) return preview;
    if (profile?.avatar) {
      return `${import.meta.env.VITE_IMG_URL}/optimized/${profile.avatar}`;
    }
    return null;
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center p-10">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-8 shadow-xl">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← Go Back
        </button>

        <h1 className="text-2xl font-semibold text-foreground">
          Profile Settings
        </h1>

        {/* Profile Photo */}
        <section className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xl font-bold text-foreground">
            {getAvatarUrl() ? (
              <img
                src={getAvatarUrl()!}
                alt="profile"
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Upload new photo
            </label>
            <input
              type="file"
              accept="image/png,image/jpg,image/jpeg,image/webp"
              onChange={handleImageUpload}
              disabled={uploading}
              className="text-sm text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {uploading && (
              <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
            )}
          </div>
        </section>

        {/* Basic Information */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">
            Basic Information
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">
                First Name
              </label>
              <input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full mt-1 rounded-md bg-background border border-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Last Name</label>
              <input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full mt-1 rounded-md bg-background border border-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full mt-1 rounded-md bg-background border border-input p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </section>

        {/* Change Password Button */}
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-1/2 bg-muted hover:bg-muted/80 text-foreground py-2 rounded-md transition-colors"
        >
          Change Password
        </button>

        {/* Account Info */}
        <section className="space-y-2 text-sm text-muted-foreground">
          <h2 className="text-lg text-foreground font-medium">
            Account Information
          </h2>
          {profile && (
            <>
              <p>
                Account created:{" "}
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </>
          )}
          {stats && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <p>Total Mind Maps: {stats.totalMindMaps}</p>
              <p>Exported Notes: {stats.totalExportedNotes}</p>
            </div>
          )}
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}

export default ProfilePage;
