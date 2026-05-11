import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { mindmapApi } from "@/api/mindmap";
import { toast } from "sonner";

interface DraftCardProps {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  edgeCount: number;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function DraftCard({
  id,
  title,
  createdAt,
  updatedAt,
  nodeCount,
  edgeCount,
  isSelected,
  onSelect,
  onDelete,
}: DraftCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Generate a consistent color based on the title
  const getColorFromTitle = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 55%)`;
  };

  const previewColor = getColorFromTitle(title);

  // Get initials/abbreviation from title
  const getAbbreviation = (str: string) => {
    if (!str || str === "untitled project") return "MW";

    // Split by spaces and take first letter of each word (max 3 letters)
    const words = str.trim().split(/\s+/);
    const abbreviation = words
      .slice(0, 3)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");

    return abbreviation || "MW";
  };

  const abbreviation = getAbbreviation(title);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await mindmapApi.deleteMindMap(id);
      toast.success("Mind map deleted successfully");
      onDelete(id);
    } catch (error) {
      toast.error("Failed to delete mind map");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(id);
  };

  const handleDoubleClick = () => {
    window.location.href = `/canva?id=${id}`;
  };

  return (
    <>
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className={`
          rounded-xl border transition-all group cursor-pointer relative
          ${
            isSelected
              ? "border-primary ring-2 ring-primary/20 bg-primary/5"
              : "border-border hover:border-primary/40 hover:shadow-lg bg-card/40"
          }
        `}
      >
        {/* Delete button - appears when selected */}
        {isSelected && (
          <button
            onClick={handleDelete}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg hover:bg-destructive/90 transition-colors z-10"
            disabled={isDeleting}
          >
            <Trash2 size={14} />
          </button>
        )}

        <div className="p-4">
          {/* Preview area with abbreviation */}
          <div
            className="h-32 rounded-md mb-4 relative overflow-hidden flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${previewColor} 0%, ${previewColor}CC 100%)`,
            }}
          >
            <span className="text-3xl font-bold text-white drop-shadow-md">
              {abbreviation}
            </span>

            {/* Show node count badge */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full">
              {nodeCount} {nodeCount === 1 ? "node" : "nodes"}
            </div>
          </div>

          <p className="text-sm font-medium text-card-foreground truncate">
            {title}
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            {nodeCount} {nodeCount === 1 ? "node" : "nodes"} • {edgeCount}{" "}
            {edgeCount === 1 ? "connection" : "connections"}
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            Created{" "}
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Updated{" "}
            {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
          </p>

          {/* Double-click hint */}
          <p className="text-[10px] text-muted-foreground/60 mt-2 italic">
            Double-click to open
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Mind Map
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{title}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border bg-background text-foreground hover:bg-muted"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default DraftCard;
