import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { createError } from "../../utils/error";
import { errorCode } from "../../config/errorCode";
import { Edge, Node } from "../../../generated/prisma/client";
import { v4 as uuidv4 } from "uuid";

interface CustomRequest extends Request {
  userId?: number;
}

export const saveMindMap = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return next(createError("Unauthorized", 401, errorCode.unauthenticated));
    }

    const { id, title, description, nodes, edges, isPublic } = req.body;

    if (id) {
      const existingMap = await prisma.mindMap.findFirst({
        where: { id, ownerId: userId },
      });

      if (!existingMap) {
        return next(createError("Mind map not found", 404, errorCode.notFound));
      }

      await prisma.$transaction([
        prisma.edge.deleteMany({ where: { mindMapId: id } }),
        prisma.node.deleteMany({ where: { mindMapId: id } }),
      ]);

      const updatedMap = await prisma.mindMap.update({
        where: { id },
        data: {
          title,
          description,
          isPublic: isPublic || false,
          nodes: {
            create: nodes.map((node: any) => ({
              id: node.id,
              label: node.data.label,
              type: node.data.nodeType || node.data.type || "DEFAULT",
              posX: node.position.x,
              posY: node.position.y,
              color: node.data.color,
              shape: node.data.shape,
              parentId: node.parentId,
              aiGenerated: node.data.aiGenerated || false,
            })),
          },
          edges: {
            create: edges.map((edge: any) => ({
              id: edge.id,
              sourceId: edge.source,
              targetId: edge.target,
              label: edge.data?.label,
            })),
          },
        },
        include: {
          nodes: true,
          edges: true,
        },
      });

      return res.status(200).json(updatedMap);
    }

    // Create new mind map
    const nodeIdMap = new Map();

    const newNodeData = nodes.map((node: any) => {
      const newId = uuidv4();
      nodeIdMap.set(node.id, newId);
      return {
        id: newId,
        label: node.data.label,
        type: node.data.nodeType || node.data.type || "DEFAULT",
        posX: node.position.x,
        posY: node.position.y,
        color: node.data.color,
        shape: node.data.shape,
        parentId: node.parentId
          ? nodeIdMap.get(node.parentId) || node.parentId
          : null,
        aiGenerated: node.data.aiGenerated || false,
      };
    });

    const newEdgeData = edges.map((edge: any) => ({
      id: uuidv4(),
      sourceId: nodeIdMap.get(edge.source) || edge.source,
      targetId: nodeIdMap.get(edge.target) || edge.target,
      label: edge.data?.label,
    }));

    const mindMap = await prisma.mindMap.create({
      data: {
        title,
        description,
        isPublic: isPublic || false,
        ownerId: userId,
        nodes: {
          create: newNodeData,
        },
        edges: {
          create: newEdgeData,
        },
      },
      include: {
        nodes: true,
        edges: true,
      },
    });

    res.status(201).json(mindMap);
  } catch (error) {
    console.error("Error saving mind map:", error);
    next(error);
  }
};

export const getMindMap = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const mindMap = await prisma.mindMap.findFirst({
      where: {
        id,
        OR: [{ ownerId: userId }, { isPublic: true }],
      },
      include: {
        nodes: true,
        edges: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!mindMap) {
      return next(createError("Mind map not found", 404, errorCode.notFound));
    }

    // Transform data to match frontend format
    const transformedMap = {
      ...mindMap,
      nodes: mindMap.nodes.map((node: Node) => ({
        id: node.id,
        type: "mindmap",
        data: {
          label: node.label,
          color: node.color || "#ffffff",
          shape: node.shape || "rectangle",
          nodeType: node.type,
          aiGenerated: node.aiGenerated,
        },
        position: {
          x: node.posX,
          y: node.posY,
        },
        parentId: node.parentId,
      })),
      edges: mindMap.edges.map((edge: Edge) => ({
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        data: {
          label: edge.label,
        },
      })),
    };

    res.status(200).json(transformedMap);
  } catch (error) {
    next(error);
  }
};
export const getUserMindMaps = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return next(createError("Unauthorized", 401, errorCode.unauthenticated));
    }

    const mindMaps = await prisma.mindMap.findMany({
      where: { ownerId: +userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            nodes: true,
            edges: true,
          },
        },
      },
    });

    res.status(200).json(mindMaps);
  } catch (error) {
    next(error);
  }
};

export const deleteMindMap = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!userId) {
      return next(createError("Unauthorized", 401, errorCode.unauthenticated));
    }

    const mindMap = await prisma.mindMap.findFirst({
      where: { id, ownerId: userId },
    });

    if (!mindMap) {
      return next(createError("Mind map not found", 404, errorCode.notFound));
    }

    await prisma.mindMap.delete({
      where: { id },
    });

    res.status(200).json({ message: "Mind map deleted successfully" });
  } catch (error) {
    next(error);
  }
};
