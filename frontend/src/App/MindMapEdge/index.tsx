// App/MindMapEdge.tsx
import { BaseEdge, type EdgeProps, getStraightPath } from "@xyflow/react";

function MindMapEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, data, selected, id } = props;

  const [edgePath] = getStraightPath({
    sourceX,
    sourceY: sourceY + 20,
    targetX,
    targetY,
  });

  // Use explicit hex colors (no CSS variables)
  const strokeColor = selected ? "#06b6d4" : "#94a3b8";
  const strokeWidth = selected ? 3 : 1.5;

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDasharray: data?.edgeType === "dotted" ? "5 5" : undefined,
        transition: "stroke 0.2s",
        cursor: "pointer",
      }}
      {...props}
    />
  );
}

export default MindMapEdge;
