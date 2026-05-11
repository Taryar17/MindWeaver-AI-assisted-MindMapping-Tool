import express from "express";
import {
  register,
  login,
  logout,
  forgetPassword,
  resetPassword,
  authCheck,
  changePassword,
} from "../../../controllers/authControllers";
import { auth } from "../../../middlewares/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", auth, changePassword);

router.get("/auth-check", auth, authCheck);

export default router;
