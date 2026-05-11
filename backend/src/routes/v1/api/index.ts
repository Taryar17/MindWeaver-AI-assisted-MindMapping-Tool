import express from "express";
import {
  updateProfileValidation,
  updateUserProfile,
  uploadProfile,
  uploadProfileMultiple,
  uploadProfileOptimize,
  getUserStats,
} from "../../../controllers/api/profileController";
import { auth } from "../../../middlewares/auth";
import upload, { uploadMemory } from "../../../middlewares/uploadFiles";
import { getMyPhoto } from "../../../controllers/api/profileController";

import { authData } from "../../../controllers/authControllers";
import {
  deleteMindMap,
  getMindMap,
  getUserMindMaps,
  saveMindMap,
} from "../../../controllers/api/mindMapController";
import {
  generateAIActions,
  generateAIActionsFromData,
  getNodeAIHistory,
  saveAIHistory,
} from "../../../controllers/api/aiController";
import {
  deleteExportedNote,
  getExportedNote,
  getUserExportedNotes,
  saveExportedNote,
  generateNote,
} from "../../../controllers/api/noteController";

const router = express.Router();

router.patch("/profile/upload", auth, upload.single("avatar"), uploadProfile);
router.patch(
  "/profile/upload/optimize",
  auth,
  upload.single("avatar"),
  uploadProfileOptimize,
);
router.patch(
  "/profile/upload/multiple",
  auth,
  upload.array("avatar"),
  uploadProfileMultiple,
);
router.get("/profile/my-photo", getMyPhoto); // Just for testing

router.get("/profile", auth, authData);
router.get("/profile/stats", auth, getUserStats);
router.put("/profile", auth, updateProfileValidation, updateUserProfile);

router.get("/mindmaps/user", auth, getUserMindMaps);
router.post("/mindmaps", auth, saveMindMap);
router.put("/mindmaps/:id", auth, saveMindMap);
router.get("/mindmaps/:id", auth, getMindMap);
router.delete("/mindmaps/:id", auth, deleteMindMap);

router.get("/notes/user", auth, getUserExportedNotes);
router.post("/notes/generate", auth, generateNote);
router.post("/notes", auth, saveExportedNote);
router.get("/notes/:id", auth, getExportedNote);
router.delete("/notes/:id", auth, deleteExportedNote);

router.post("/ai/generate", auth, generateAIActions);
router.post("/ai/history", auth, saveAIHistory);
router.get("/ai/history/:nodeId", auth, getNodeAIHistory);
router.post("/ai/generate-from-data", auth, generateAIActionsFromData);
export default router;
