import { type Node } from "@xyflow/react";

export type MindMapNodeData = {
  label: string;
  color: string;
  shape: "rectangle" | "circle";
};

export type MindMapEdgeData = {
  edgeType: "straight" | "dotted";
};

export type MindMapNode = Node<MindMapNodeData, "mindmap">;
