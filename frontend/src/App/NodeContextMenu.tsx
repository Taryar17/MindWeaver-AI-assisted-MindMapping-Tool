// components/NodeContextMenu.tsx
import { useEffect, useRef } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Copy,
  Sparkles,
  Brain,
  FileText,
  X,
} from "lucide-react";

interface NodeContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  onClose: () => void;
  onAddChild: () => void;
  onAddSibling: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onGenerateChildIdeas: () => void;
  onSuggestConcepts: () => void;
  onExpandSummary: () => void;
}

export function NodeContextMenu({
  x,
  y,
  nodeId,
  onClose,
  onAddChild,
  onAddSibling,
  onEdit,
  onDelete,
  onGenerateChildIdeas,
  onSuggestConcepts,
  onExpandSummary,
}: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const adjustedX = Math.min(x, window.innerWidth - 280);
  const adjustedY = Math.min(y, window.innerHeight - 400);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-64 bg-card border border-border rounded-lg shadow-2xl animate-in fade-in zoom-in duration-200"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {/* Node Info */}
      <div className="px-3 py-2 border-b border-border bg-muted/50 rounded-t-lg">
        <p className="text-xs font-medium text-muted-foreground">
          Node Actions
        </p>
      </div>

      {/* Main Actions */}
      <div className="p-2 border-b border-border">
        <button
          onClick={() => {
            onEdit();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <Edit size={16} className="text-muted-foreground" />
          <span>Edit Text</span>
        </button>

        <button
          onClick={() => {
            onAddChild();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <Plus size={16} className="text-muted-foreground" />
          <span>Add Child Node</span>
        </button>

        <button
          onClick={() => {
            onAddSibling();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <Copy size={16} className="text-muted-foreground" />
          <span>Add Sibling Node</span>
        </button>
      </div>

      {/* AI Actions */}
      <div className="p-2 border-b border-border">
        <div className="px-3 py-1">
          <p className="text-xs font-medium text-primary flex items-center gap-1">
            <Sparkles size={12} />
            AI Actions
          </p>
        </div>

        <button
          onClick={() => {
            onGenerateChildIdeas();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <Brain size={16} className="text-muted-foreground" />
          <span>Generate Child Ideas</span>
        </button>

        <button
          onClick={() => {
            onSuggestConcepts();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <Sparkles size={16} className="text-muted-foreground" />
          <span>Suggest Related Concepts</span>
        </button>

        <button
          onClick={() => {
            onExpandSummary();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <FileText size={16} className="text-muted-foreground" />
          <span>Expand into Summary</span>
        </button>
      </div>

      {/* Delete Action */}
      <div className="p-2">
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
          <Trash2 size={16} />
          <span>Delete Node</span>
        </button>
      </div>
    </div>
  );
}
