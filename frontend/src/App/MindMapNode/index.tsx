import { Handle, type NodeProps, Position } from "@xyflow/react";
import useStore from "../store";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { MindMapNode } from "../types";

function MindMapNodes({ id, data }: NodeProps<MindMapNode>) {
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 1);
  }, []);

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.width = `${data.label.length * 8}px`;
    }
  }, [data.label.length]);
  return (
    <>
      <div
        className="inputWrapper"
        style={{
          background: data.color,
          borderRadius: data.shape === "circle" ? "999px" : "4px",
          padding: "6px 10px",
        }}
      >
        <div className="dragHandle">
          <svg viewBox="0 0 24 24">
            <path
              fill="#333"
              stroke="#333"
              strokeWidth="1"
              d="M15 5h2V3h-2v2zM7 5h2V3H7v2zm8 8h2v-2h-2v2zm-8 0h2v-2H7v2zm8 8h2v-2h-2v2zm-8 0h2v-2H7v2z"
            />
          </svg>
        </div>
        <input
          value={data.label}
          onChange={(evt) => updateNodeLabel(id, evt.target.value)}
          className="input"
          ref={inputRef}
        />
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}

export default MindMapNodes;
