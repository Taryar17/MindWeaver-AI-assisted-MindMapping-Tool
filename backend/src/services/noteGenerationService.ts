import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.VERTEX_API_KEY,
  vertexai: true,
});

export interface MindMapForNote {
  id: string;
  title: string;
  description?: string | null;
  nodes: Array<{
    id: string;
    label: string;
    content?: string | null;
    parentId: string | null;
    children?: Array<any>;
  }>;
}

export const generateNoteFromMindMap = async (mindMap: MindMapForNote) => {
  // Build a hierarchical representation of the mind map
  const buildHierarchy = (
    nodes: any[],
    parentId: string | null = null,
  ): any[] => {
    return nodes
      .filter((node) => node.parentId === parentId)
      .map((node) => ({
        ...node,
        children: buildHierarchy(nodes, node.id),
      }));
  };

  const hierarchy = buildHierarchy(mindMap.nodes);

  // Format the mind map structure for the AI prompt
  const formatNode = (node: any, level: number = 0): string => {
    const indent = "  ".repeat(level);
    let result = `${indent}- ${node.label}`;
    if (node.children && node.children.length > 0) {
      result +=
        "\n" +
        node.children
          .map((child: any) => formatNode(child, level + 1))
          .join("\n");
    }
    return result;
  };

  const mindMapStructure = hierarchy.map((node) => formatNode(node)).join("\n");

  const prompt = `
You are given a mind map titled "${mindMap.title}" with the following structure:

${mindMapStructure}

Task: Generate a comprehensive, well-structured note based on this mind map. The note should:
1. Start with an introduction that explains the main topic
2. Organize content hierarchically following the mind map structure
3. Expand each node into detailed paragraphs with explanations
4. Include relevant connections between different branches
5. Include a conclusion summarizing the key points
6. End with  "Reflective Insights" that discusses possible thought patterns, cognitive approaches, and thinking strategies the user might have employed while creating this mind map. Consider:
   - How the user organized information (hierarchical vs. lateral thinking)
   - Potential connections the user identified between concepts
   - Possible knowledge gaps or areas for further exploration
   - The user's apparent focus areas or priorities based on node depth and detail
   - Suggested mental frameworks that could enhance understanding of this topic

Format the note in Markdown with appropriate headings (H1, H2, H3) for each level.
Make it detailed, educational, and well-structured.

Return ONLY the generated note in Markdown format. Do not include any additional text or explanations.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Note generation failed:", error);
    throw error;
  }
};
