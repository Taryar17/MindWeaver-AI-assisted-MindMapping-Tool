import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { createError } from "../../utils/error";
import { errorCode } from "../../config/errorCode";
import { generateNoteFromMindMap } from "../../services/noteGenerationService";
import { checkUserExist, checkUserIfNotExist } from "../../utils/auth";

interface CustomRequest extends Request {
  userId?: number;
}

export const generateNote = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    checkUserIfNotExist(userId);
    const { mindMapId } = req.body;

    if (!userId) {
      return next(createError("Unauthorized", 401, errorCode.unauthenticated));
    }

    // Fetch the mind map with all nodes
    const mindMap = await prisma.mindMap.findFirst({
      where: {
        id: mindMapId,
        ownerId: userId,
      },
      include: {
        nodes: true,
      },
    });

    if (!mindMap) {
      return next(createError("Mind map not found", 404, errorCode.notFound));
    }

    // Generate note from mind map
    const noteContent = await generateNoteFromMindMap({
      id: mindMap.id,
      title: mindMap.title,
      description: mindMap.description,
      nodes: mindMap.nodes,
    });

    res.status(200).json({ content: noteContent });
  } catch (error) {
    next(error);
  }
};

export const saveExportedNote = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    checkUserIfNotExist(userId);
    const { mindMapId, title, content, format } = req.body;

    if (!userId) {
      return next(createError("Unauthorized", 401, errorCode.unauthenticated));
    }

    // Create a new exported note
    const note = await prisma.exportedNote.create({
      data: {
        title,
        content,
        format: format || "markdown",
        mindMapId,
        ownerId: userId,
      },
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

export const getUserExportedNotes = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    checkUserIfNotExist(userId);
    const notes = await prisma.exportedNote.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        mindMap: {
          select: {
            title: true,
          },
        },
      },
    });

    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

export const getExportedNote = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    checkUserIfNotExist(userId);
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const note = await prisma.exportedNote.findFirst({
      where: {
        id,
        ownerId: userId,
      },
      include: {
        mindMap: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!note) {
      return next(createError("Note not found", 404, errorCode.notFound));
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const deleteExportedNote = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    checkUserIfNotExist(userId);
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const note = await prisma.exportedNote.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!note) {
      return next(createError("Note not found", 404, errorCode.notFound));
    }

    await prisma.exportedNote.delete({
      where: { id },
    });

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    next(error);
  }
};
