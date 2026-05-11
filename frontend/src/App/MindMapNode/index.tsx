import { Handle, type NodeProps, Position } from "@xyflow/react";
import useStore from "../store";
import { useEffect, useRef, useState } from "react";
import type { MindMapNode } from "../types";
import { Sparkles } from "lucide-react";

function getTextColor(bg: string) {
  if (!bg.startsWith("#")) return "#fff";

  const r = parseInt(bg.substring(1, 3), 16);
  const g = parseInt(bg.substring(3, 5), 16);
  const b = parseInt(bg.substring(5, 7), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.6 ? "#0f172a" : "#ffffff";
}

function MindMapNodes({ id, data }: NodeProps<MindMapNode>) {
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const selectedNodeId = useStore((state) => state.selectedNodeId);
  const isSelected = selectedNodeId === id;

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isEditing) {
      if (data.nodeType === "SUMMARY" && textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
      } else if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    }
  }, [isEditing, data.nodeType]);

  const textColor = getTextColor(data.color);

  // Stop drag events from propagating when interacting with input
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const stopDragIfEditing = (e: React.MouseEvent) => {
    if (isEditing) {
      e.stopPropagation();
    }
  };

  // For summary nodes, use textarea for multiline content
  if (data.nodeType === "SUMMARY") {
    return (
      <>
        <div
          onDoubleClick={() => setIsEditing(true)}
          onMouseDownCapture={stopDragIfEditing}
          className={`inputWrapper cursor-move ${isSelected ? "selected" : ""}`}
          style={{
            backgroundColor: data.color,
            padding: "16px 20px",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            minWidth: "280px",
            maxWidth: "400px",
            width: "fit-content",
            height: "fit-content",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            border: isSelected
              ? "2px solid var(--primary)"
              : "2px solid transparent",
            transition: "all 0.2s ease",
          }}
        >
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={data.label}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  setIsEditing(false);
                }
              }}
              onChange={(evt) => updateNodeLabel(id, evt.target.value)}
              className="bg-transparent border-none outline-none font-medium resize-none"
              style={{
                color: textColor,
                width: "100%",
                minHeight: "100px",
                fontFamily: "inherit",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
              autoFocus
              onMouseDown={handleMouseDown}
            />
          ) : (
            <p
              className="whitespace-pre-wrap break-words"
              style={{
                color: textColor,
                fontSize: "14px",
                lineHeight: "1.6",
                margin: 0,
                cursor: "grab",
              }}
            >
              {data.label}
            </p>
          )}

          {/* AI-generated badge */}
          {data.aiGenerated && (
            <div className="flex items-center gap-1 mt-2 text-[10px] opacity-70">
              <Sparkles size={10} />
              <span>AI-generated</span>
            </div>
          )}
        </div>

        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!scale-125 transition-transform"
        />
      </>
    );
  }

  // Regular node
  return (
    <>
      <div
        onDoubleClick={() => {
          if (isSelected) setIsEditing(true);
        }}
        onMouseDownCapture={stopDragIfEditing}
        className={`inputWrapper cursor-move ${isSelected ? "selected" : ""}`}
        style={{
          backgroundColor: data.color,
          padding: data.shape === "rectangle" ? "10px 18px" : "12px",
          borderRadius: data.shape === "circle" ? "999px" : "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "80px",
          minHeight: data.shape === "circle" ? "60px" : "auto",
          width: "fit-content",
          height: "fit-content",
          boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
          border: isSelected
            ? "2px solid var(--primary)"
            : "2px solid transparent",
          transition: "all 0.2s ease",
        }}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            value={data.label}
            autoFocus
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setIsEditing(false);
              }
            }}
            onChange={(evt) => updateNodeLabel(id, evt.target.value)}
            className="bg-transparent border-none outline-none text-center font-semibold"
            style={{
              color: textColor,
              width: "auto",
              minWidth: "60px",
            }}
            onMouseDown={handleMouseDown}
          />
        ) : (
          <span
            style={{
              color: textColor,
              fontWeight: 600,
              textAlign: "center",
              userSelect: "none",
            }}
          >
            {data.label}
          </span>
        )}

        {data.aiGenerated && (
          <div className="absolute -top-2 -right-2">
            <Sparkles size={12} className="text-primary" />
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
    </>
  );
}

export default MindMapNodes;
