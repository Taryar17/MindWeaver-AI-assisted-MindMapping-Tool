import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { getUserbyEmail, getUserbyId } from "../services/authService";
import { checkUserExist, checkUserIfNotExist } from "../utils/auth";
import { generateToken } from "../utils/generate";
import bcrypt from "bcrypt";
import { createUser, updateUser } from "../services/authService";
import moment from "moment";
import jwt from "jsonwebtoken";
import { errorCode } from "../config/errorCode";
import { createError } from "../utils/error";
import { prisma } from "../lib/prisma";
import { sendEmail } from "../utils/sendEmail";

export const register = [
  body("email", "Invalid Email").trim().notEmpty().isEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { email, password, firstName, lastName } = req.body;

    const user = await getUserbyEmail(email);
    checkUserExist(user);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const randToken = "I will replace Refresh Token soon.";

    const userData = {
      password: hashedPassword,
      randToken,
      firstName: firstName || null,
      lastName: lastName || null,
      email: email || null,
    };
    const newUser = await createUser(userData);

    const accessTokenPayload = { id: newUser.id };
    const refreshTokenPayload = { id: newUser.id, email: newUser.email };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15, // 15 min
      },
    );

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "15d", // 15 days
      },
    );

    // Updating randToken with refreshToken
    const userUpdateData = {
      randToken: refreshToken,
    };
    await updateUser(newUser.id, userUpdateData);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
      })
      .status(201)
      .json({
        message: "Successfully created an account.",
        userId: newUser.id,
        userInfo: {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
        },
      });
  },
];

export const login = [
  body("email", "Invalid Email").trim().notEmpty().isEmail(),
  body("password", "Password must be at least 8 characters")
    .trim()
    .notEmpty()
    .isLength({ min: 8 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { email, password } = req.body;

    const user = await getUserbyEmail(email);
    checkUserIfNotExist(user);

    // If wrong password was over limit
    if (user!.status === "FREEZE") {
      return next(
        createError(
          "Your account is temporarily locked. Please contact us.",
          401,
          errorCode.accountFreeze,
        ),
      );
    }

    const isMatchPassword = await bcrypt.compare(password, user!.password);
    if (!isMatchPassword) {
      // Starting to record wrong times
      const lastRequest = new Date(user!.updatedAt).toLocaleDateString();
      const isSameDate = lastRequest == new Date().toLocaleDateString();

      // Today password is wrong first time
      if (!isSameDate) {
        const userData = {
          errorLoginCount: 1,
        };
        await updateUser(user!.id, userData);
      } else {
        // Today password was wrong 2 times
        if (user!.errorLoginCount >= 2) {
          const userData = {
            status: "FREEZE",
          };
          await updateUser(user!.id, userData);
        } else {
          // Today password was wrong one time
          const userData = {
            errorLoginCount: {
              increment: 1,
            },
          };
          await updateUser(user!.id, userData);
        }
      }
      //  Ending
      return next(createError("Wrong Password", 401, errorCode.invalid));
    }

    // Authorization token
    const accessTokenPayload = { id: user!.id };
    const refreshTokenPayload = { id: user!.id, email: user!.email };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15, // 15 min
      },
    );

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "15d",
      },
    );

    const userData = {
      errorLoginCount: 0, // reset error count
      randToken: refreshToken,
    };

    await updateUser(user!.id, userData);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
      })
      .status(200)
      .json({
        message: "Successfully Logged In.",
        userId: user!.id,
      });
  },
];

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;
  if (!refreshToken) {
    return next(
      createError(
        "You are not an authenticated user!.",
        401,
        errorCode.unauthenticated,
      ),
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
      id: number;
      email: string;
    };
  } catch (err) {
    return next(
      createError(
        "You are not an authenticated user!.",
        401,
        errorCode.unauthenticated,
      ),
    );
  }

  if (isNaN(decoded.id)) {
    return next(
      createError(
        "You are not an authenticated user!.",
        401,
        errorCode.unauthenticated,
      ),
    );
  }

  const user = await getUserbyId(decoded.id);
  checkUserIfNotExist(user);

  if (user!.email !== decoded.email) {
    return next(
      createError(
        "You are not an authenticated user!.",
        401,
        errorCode.unauthenticated,
      ),
    );
  }

  const userData = {
    randToken: generateToken(),
  };
  await updateUser(user!.id, userData);

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: "/",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: "/",
  });

  res.status(200).json({ message: "Successfully logged out. See you soon." });
};

export const forgetPassword = [
  body("email", "Invalid Email.").trim().notEmpty().isEmail(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    let email = req.body.email;

    const user = await getUserbyEmail(email);
    checkUserIfNotExist(user);
    const token = generateToken();
    const data = {
      randToken: token,
    };

    await updateUser(user!.id, data);

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    await sendEmail(
      email,
      "Reset Password",
      `Click this link to reset your password: ${resetLink}`,
    );

    res.json({
      message: "Password reset link sent to email",
    });
  },
];

export const resetPassword = [
  // Validate and sanitize fields.
  body("token", "Token must not be empty.").trim().notEmpty().escape(),
  body("password", "Password must be at least 8 characters.")
    .trim()
    .notEmpty()
    .isLength({ min: 8 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { randToken: token },
    });
    checkUserIfNotExist(user);

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // jwt token
    const accessPayload = { id: user!.id };
    const refreshPayload = { id: user!.id, email: user!.email };

    const accessToken = jwt.sign(
      accessPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15, // 15 mins
      },
    );

    const refreshToken = jwt.sign(
      refreshPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "15d", // "15d" in production
      },
    );

    const userUpdateData = {
      password: hashPassword,
      randToken: refreshToken,
    };
    await updateUser(user!.id, userUpdateData);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 15 * 60 * 1000, // 15 mins
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
      })
      .status(200)
      .json({
        message: "Successfully reset your password.",
        userId: user!.id,
      });
  },
];

export const changePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(errors.array()[0].msg, 400, errorCode.invalid));
    }

    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return next(createError("Unauthorized", 401, errorCode.unauthenticated));
    }

    const user = await getUserbyId(userId);
    checkUserIfNotExist(user);

    const isMatch = await bcrypt.compare(currentPassword, user!.password);
    if (!isMatch) {
      return next(
        createError("Current password is incorrect", 400, errorCode.invalid),
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await updateUser(userId, { password: hashedPassword });

    res.status(200).json({ message: "Password changed successfully" });
  },
];

interface CustomRequest extends Request {
  userId?: number;
}

export const authCheck = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;
  const user = await getUserbyId(userId!);
  checkUserIfNotExist(user);

  res.status(200).json({
    message: "You are authenticated.",
    userId: user?.id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    username: user?.firstName + " " + user?.lastName,
    email: user?.email,
    avatar: user?.avatar,
    role: user?.role,
  });
};

export const authData = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;
  const user = await getUserbyId(userId!);
  checkUserIfNotExist(user);

  res.status(200).json({
    userId: user?.id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    username: user?.firstName + " " + user?.lastName,
    email: user?.email,
    avatar: user?.avatar,
    role: user?.role,
    createdAt: user?.createdAt,
  });
};
