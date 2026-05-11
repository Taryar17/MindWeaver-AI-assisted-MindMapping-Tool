import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { createError } from "../../utils/error";
import { errorCode } from "../../config/errorCode";
import { generateAIContent } from "../../services/aiService";

interface CustomRequest extends Request {
  userId?: number;
}

export const generateAIActions = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const { mindMapId, nodeId, action } = req.body;

    if (!userId) {
      return next(createError("Unauthorized", 401, errorCode.unauthenticated));
    }

    // Fetch the mind map with all nodes and edges
    const mindMap = await prisma.mindMap.findFirst({
      where: {
        id: mindMapId,
        ownerId: userId,
      },
      include: {
        nodes: true,
        edges: true,
      },
    });

    if (!mindMap) {
      return next(createError("Mind map not found", 404, errorCode.notFound));
    }

    // Transform data for AI
    const mindMapData = {
      nodes: mindMap.nodes.map((node) => ({
        id: node.id,
        label: node.label,
        parentId: node.parentId,
      })),
      edges: mindMap.edges.map((edge) => ({
        source: edge.sourceId,
        target: edge.targetId,
      })),
    };

    // Generate AI content
    const result = await generateAIContent({
      mindMap: mindMapData,
      selectedNodeId: nodeId,
      action,
    });

    res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
};

export const saveAIHistory = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const { nodeId, prompt, response, model } = req.body;

    if (!userId) {
      return next(createError("Unauthorized", 401, errorCode.unauthenticated));
    }

    const aiHistory = await prisma.aIHistory.create({
      data: {
        nodeId,
        prompt,
        response,
        model,
      },
    });

    res.status(201).json(aiHistory);
  } catch (error) {
    next(error);
  }
};

export const getNodeAIHistory = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const { nodeId } = req.params;

    const nodeid = Array.isArray(nodeId) ? nodeId[0] : nodeId;

    if (!userId) {
      return next(createError("Unauthorized", 401, errorCode.unauthenticated));
    }

    const history = await prisma.aIHistory.findMany({
      where: { nodeId: nodeid },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

export const generateAIActionsFromData = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const { nodes, edges, nodeId, action } = req.body;

    if (!userId) {
      return next(createError("Unauthorized", 401, errorCode.unauthenticated));
    }

    // Validate required fields
    if (!nodes || !edges || !nodeId || !action) {
      return next(
        createError("Missing required fields", 400, errorCode.invalid),
      );
    }

    // Transform the received data for the AI service
    const mindMapData = {
      nodes: nodes.map((node: any) => ({
        id: node.id,
        label: node.label,
        parentId: node.parentId,
      })),
      edges: edges.map((edge: any) => ({
        source: edge.source,
        target: edge.target,
      })),
    };

    // Generate AI content using your existing service
    const result = await generateAIContent({
      mindMap: mindMapData,
      selectedNodeId: nodeId,
      action,
    });

    res.status(200).json({ result });
  } catch (error) {
    console.error("AI generation from data failed:", error);
    next(error);
  }
};
