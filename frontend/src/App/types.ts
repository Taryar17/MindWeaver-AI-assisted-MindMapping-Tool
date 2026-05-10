import { type Node } from "@xyflow/react";

export type MindMapNodeData = {
  aiGenerated: boolean;
  isSummary: boolean;
  label: string;
  color: string;
  shape: "rectangle" | "circle";
  nodeType: "ROOT" | "DEFAULT" | "SUMMARY";
};

export type MindMapNode = Node<MindMapNodeData, "mindmap">;
