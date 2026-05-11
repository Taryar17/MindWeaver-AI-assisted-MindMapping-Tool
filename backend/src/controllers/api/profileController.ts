import { Request, Response, NextFunction } from "express";
import { unlink } from "node:fs/promises";
import path from "path";
import { getUserbyId, updateUser } from "../../services/authService";
import { checkUserIfNotExist } from "../../utils/auth";
import { checkUploadFile } from "../../utils/check";
import imageQueue from "../../jobs/queues/imageQueue";
import { createError } from "../../utils/error";
import { errorCode } from "../../config/errorCode";
import { prisma } from "../../services/prismaClient";
import { body, validationResult } from "express-validator";

interface CustomRequest extends Request {
  userId?: number;
}

export const uploadProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;
  const image = req.file;
  const user = await getUserbyId(userId!);
  checkUserIfNotExist(user);
  checkUploadFile(image);

  const fileName = image!.filename;

  if (user?.avatar) {
    try {
      const filePath = path.join(
        __dirname,
        "../../../",
        "uploads/images",
        user!.avatar!,
      );
      await unlink(filePath);
    } catch (error) {
      console.log(error);
    }
  }

  const userData = {
    image: fileName,
  };

  await updateUser(userId!, userData);
  res.status(200).json({
    message: "Profile picture uploaded successfully",
  });
};

//testing
export const getMyPhoto = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const file = path.join(
    __dirname,
    "../../../",
    "uploads/images",
    "1755280127672=415852824-coding_crocodile.jpg",
  );

  res.sendFile(file, (err) => res.status(404).send("File not found"));
};

export const uploadProfileMultiple = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  console.log("req.files-----", req.files);
  res.status(200).json({
    message: "Multiple files uploaded successfully",
  });
};

export const uploadProfileOptimize = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    console.log("Uploading avatar for user:", userId);

    const image = req.file;
    if (!image) {
      return next(createError("No file uploaded", 400, errorCode.invalid));
    }

    const user = await getUserbyId(userId!);
    checkUserIfNotExist(user);
    checkUploadFile(image);

    const splitFileName = req.file?.filename.split(".")[0];
    const optimizedFileName = `${splitFileName}.webp`;
    console.log("Optimized file name:", optimizedFileName);

    const job = await imageQueue.add(
      "optimize-image",
      {
        filePath: req.file?.path,
        fileName: optimizedFileName,
        width: 200,
        height: 200,
        quality: 50,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    );

    console.log("Image optimization completed");

    // Delete old avatar files
    if (user?.avatar) {
      try {
        const originalFilePath = path.join(
          __dirname,
          "../../../",
          "uploads/images",
          user!.avatar!.split(".")[0] + ".*",
        );
        const optimizedFilePath = path.join(
          __dirname,
          "../../../",
          "uploads/optimized",
          user!.avatar,
        );
        await unlink(originalFilePath).catch(() => {});
        await unlink(optimizedFilePath).catch(() => {});
      } catch (error) {
        console.log("Error deleting old files:", error);
      }
    }

    // Update user with new avatar
    const updatedUser = await updateUser(userId!, {
      avatar: optimizedFileName,
    });
    console.log("User updated with new avatar:", updatedUser);

    res.status(200).json({
      message: "Profile picture optimized and uploaded successfully",
      image: optimizedFileName,
      jobId: job.id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    next(error);
  }
};

interface CustomRequest extends Request {
  userId?: number;
}

// Update user profile
export const updateProfileValidation = [
  body("firstName").optional().trim().escape(),
  body("lastName").optional().trim().escape(),
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("address").optional().trim().escape(),
  body("city").optional().trim().escape(),
  body("region").optional().trim().escape(),
];

export const updateUserProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(errors.array()[0].msg, 400, errorCode.invalid));
  }

  const userId = req.userId;
  if (!userId) {
    return next(
      createError("User not authenticated", 401, errorCode.unauthenticated),
    );
  }

  const { firstName, lastName, email, address, city, region } = req.body;

  try {
    const user = await getUserbyId(userId!);
    checkUserIfNotExist(user);

    const updatedUser = await updateUser(userId!, {
      firstName,
      lastName,
      email,
      address,
      city,
      region,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return next(createError("Failed to update profile", 500, errorCode.server));
  }
};

export const getUserStats = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return next(createError("Unauthorized", 401, errorCode.unauthenticated));
    }

    const [totalMindMaps, totalExportedNotes] = await Promise.all([
      prisma.mindMap.count({ where: { ownerId: userId } }),
      prisma.exportedNote.count({ where: { ownerId: userId } }),
    ]);

    res.status(200).json({
      totalMindMaps,
      totalExportedNotes,
    });
  } catch (error) {
    next(error);
  }
};
