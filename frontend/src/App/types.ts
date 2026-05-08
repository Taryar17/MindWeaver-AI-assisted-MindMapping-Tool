import { type Node } from "@xyflow/react";

export type MindMapNodeData = {
  aiGenerated: boolean;
  isSummary: boolean;
  label: string;
  color: string;
  shape: "rectangle" | "circle";
};

export type MindMapNode = Node<MindMapNodeData, "mindmap">;
