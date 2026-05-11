import { useState, useRef, useEffect } from "react";
import { Save, Upload, Share2, FileText } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Link } from "react-router-dom";
import { Icons } from "../icons";
import useStore from "@/App/store";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import { NoteGenerationModal } from "../util/NoteGenerationModal";

function CanvaNav() {
  const {
    mindMapTitle,
    setMindMapTitle,
    saveMindMap,
    mindMapId,
    undo,
    redo,
    canUndo,
    canRedo,
    exportMindmap,
  } = useStore((state) => ({
    mindMapTitle: state.mindMapTitle,
    setMindMapTitle: state.setMindMapTitle,
    saveMindMap: state.saveMindMap,
    mindMapId: state.mindMapId,
    undo: state.undo,
    redo: state.redo,
    canUndo: state.canUndo,
    canRedo: state.canRedo,
    exportMindmap: state.exportMindmap,
  }));

  const { profile, loadProfile } = useUserStore();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing, mindMapTitle]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMindMap();
      toast.success(
        mindMapId ? "Mind map updated!" : "Mind map saved successfully!",
      );
    } catch (error) {
      toast.error("Failed to save mind map");
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleExport = async () => {
    try {
      const filename = `${mindMapTitle || "mindmap"}_${Date.now()}`;

      await exportMindmap("png", filename);

      toast.success("Mindmap exported!");
    } catch (error) {
      console.error(error);
      toast.error("Export failed");
    }
  };

  return (
    <div className="w-full h-20 flex items-center justify-between px-6 border-b border-border bg-background">
      <div className="flex items-center gap-4 min-w-0 shrink">
        <div className="flex items-center gap-2 font-semibold shrink-0">
          <Link to="/" className="flex gap-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="text-foreground">MindWeaver</span>
          </Link>
        </div>

        <div className="relative w-60 shrink-0">
          {editing ? (
            <input
              ref={inputRef}
              value={mindMapTitle}
              onChange={(e) => setMindMapTitle(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditing(false);
              }}
              className="w-full h-7 bg-transparent text-foreground outline-none border-b border-primary"
              style={{
                minWidth: "100px",
              }}
            />
          ) : (
            <h2
              onDoubleClick={() => setEditing(true)}
              className="h-7 flex items-center text-muted-foreground cursor-text hover:text-foreground transition-colors whitespace-nowrap"
              style={{
                minWidth: "100px",
                borderBottom: "1px solid transparent",
              }}
            >
              {mindMapTitle}
            </h2>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`flex items-center justify-center p-2 rounded-md transition-colors ${
              canUndo
                ? "text-foreground hover:bg-muted"
                : "text-muted-foreground/50 cursor-not-allowed"
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Icons.Undo size={16} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`flex items-center justify-center p-2 rounded-md transition-colors ${
              canRedo
                ? "text-foreground hover:bg-muted"
                : "text-muted-foreground/50 cursor-not-allowed"
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Icons.Redo size={16} />
          </button>
        </div>
        <div className="h-6 w-px bg-border" />
        <button
          onClick={() => setShowNoteModal(true)}
          className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-2 py-1.5 rounded-md transition-colors text-sm whitespace-nowrap"
        >
          <FileText size={14} />
          Generate Notes
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-2 py-1.5 rounded-md transition-colors text-sm whitespace-nowrap"
        >
          <Upload size={14} />
          Export
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-2 py-1.5 rounded-md transition-colors text-sm whitespace-nowrap"
        >
          <Save size={14} className={isSaving ? "animate-pulse" : ""} />
          {isSaving ? "Saving..." : "Save"}
        </button>
        <div className="h-6 w-px bg-border" />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <ModeToggle />
        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-foreground font-medium whitespace-nowrap">
              {getDisplayName()}
            </p>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {profile?.email || ""}
            </p>
          </div>
          {getAvatarUrl() ? (
            <img
              src={getAvatarUrl()!}
              alt={getDisplayName()}
              className="h-9 w-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-semibold text-primary-foreground flex-shrink-0">
              {getInitials()}
            </div>
          )}
        </div>
      </div>

      {showNoteModal && (
        <NoteGenerationModal
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          mindMapId={mindMapId || ""}
          mindMapTitle={mindMapTitle}
          onNoteGenerated={() => {}}
        />
      )}
    </div>
  );
}

export default CanvaNav;
