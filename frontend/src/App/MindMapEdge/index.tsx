import { BaseEdge, type EdgeProps, getStraightPath } from "@xyflow/react";

function MindMapEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, data } = props;

  const [edgePath] = getStraightPath({
    sourceX,
    sourceY: sourceY + 20,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      path={edgePath}
      style={{
        strokeDasharray: data?.edgeType === "dotted" ? "5 5" : undefined,
      }}
      {...props}
    />
  );
}

export default MindMapEdge;
