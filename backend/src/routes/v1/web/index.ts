import express from "express";
import { auth } from "../../../middlewares/auth";
import { authorise } from "../../../middlewares/authorise";
import userRoutes from "../api";
import authRoutes from "./auth";
import adminRoutes from "../admin";
import { maintenance } from "../../../middlewares/maintenance";

const router = express.Router();
router.use("/api/v1", authRoutes);
router.use(
  "/api/v1/admins",

  auth,
  authorise(true, "ADMIN"),
  adminRoutes,
);
router.use("/api/v1/users", userRoutes);

// router.use("/api/v1", maintenance, authRoutes);
// router.use(
//   "/api/v1/admin",
//   maintenance,
//   auth,
//   authorise(true, "ADMIN"),
//   adminRoutes
// );
// router.use("/api/v1/user", maintenance, userRoutes);

export default router;
