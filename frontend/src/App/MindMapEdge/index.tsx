import { BaseEdge, type EdgeProps, getStraightPath } from "@xyflow/react";

function MindMapEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, data, selected, id } = props;

  const [edgePath] = getStraightPath({
    sourceX,
    sourceY: sourceY + 20,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: selected ? "var(--primary)" : "var(--muted-foreground)",
        strokeWidth: selected ? 3 : 1.5,
        strokeDasharray: data?.edgeType === "dotted" ? "5 5" : undefined,
        transition: "stroke 0.2s",
        cursor: "pointer",
      }}
      {...props}
    />
  );
}

export default MindMapEdge;
