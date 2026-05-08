import { Link } from "react-router-dom";
import { Icons } from "@/components/icons";
import { FieldSeparator } from "@/components/ui/field";
import { LogoutConfirmDialog } from "@/components/util/Alert-Dialogue";
import { CreateCanvasDialog } from "@/components/util/CanvaCreate-Dialogue";
import { useState, useEffect } from "react";
import { useUserStore } from "@/store/userStore";

function Sidebar() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showCreateCanvasDialog, setShowCreateCanvasDialog] = useState(false);
  const { profile, stats, loadProfile, loadStats, isLoading } = useUserStore();

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const getInitials = () => {
    if (!profile) return "U";
    const first = profile.firstName?.[0] || "";
    const last = profile.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const getDisplayName = () => {
    if (!profile) return "User";
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile.firstName) return profile.firstName;
    return profile.email?.split("@")[0] || "User";
  };

  const getAvatarUrl = () => {
    if (profile?.avatar) {
      return `${import.meta.env.VITE_API_URL}/uploads/optimized/${profile.avatar}`;
    }
    return null;
  };

  if (isLoading && !profile) {
    return (
      <aside className="w-64 border-r border-border bg-background/60 backdrop-blur-xl p-6 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </aside>
    );
  }

  return (
    <>
      <aside className="w-64 border-r border-border bg-background/60 backdrop-blur-xl p-6 flex flex-col">
        <div className="flex flex-col items-center gap-3 mb-4">
          {getAvatarUrl() ? (
            <img
              src={getAvatarUrl()!}
              alt={getDisplayName()}
              className="size-14 rounded-full object-cover"
            />
          ) : (
            <div className="size-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-lg font-bold text-primary-foreground">
              {getInitials()}
            </div>
          )}

          <div className="text-center">
            <p className="font-medium text-foreground">{getDisplayName()}</p>
            <p className="text-xs text-muted-foreground">
              {profile?.email || ""}
            </p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 mb-4 text-center">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {stats.totalMindMaps}
              </p>
              <p className="text-xs text-muted-foreground">Maps</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {stats.totalExportedNotes}
              </p>
              <p className="text-xs text-muted-foreground">Notes</p>
            </div>
          </div>
        )}

        <div className="flex justify-around mb-4">
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Link to="/profile">
              <Icons.user className="h-7 w-7" />
            </Link>
          </button>

          <button
            onClick={() => setShowLogoutDialog(true)}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Icons.exit className="h-7 w-7" />
          </button>
        </div>

        <FieldSeparator className="mb-4 border-border" />

        <button
          onClick={() => setShowCreateCanvasDialog(true)}
          className="mb-6 w-full rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground py-2 text-sm font-medium shadow-lg shadow-primary/20"
        >
          + Create New Canvas
        </button>

        <nav className="flex flex-col gap-2 text-sm">
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center"
          >
            <Icons.home className="size-5 mr-2" />
            Home
          </Link>
          <Link
            to="/current-work"
            className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center"
          >
            <Icons.work className="size-5 mr-2" />
            Current Work
          </Link>
          <Link
            to="/drafts"
            className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center"
          >
            <Icons.stack className="size-5 mr-2" />
            Drafts
          </Link>
          <Link
            to="/exported-notes"
            className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center"
          >
            <Icons.doc className="size-5 mr-2" /> Exported Notes
          </Link>
        </nav>
      </aside>

      <LogoutConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
      />
      <CreateCanvasDialog
        open={showCreateCanvasDialog}
        onOpenChange={setShowCreateCanvasDialog}
      />
    </>
  );
}

export default Sidebar;
