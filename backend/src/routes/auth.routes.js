import express from "express";
import {
  signUp,
  signIn,
  forgetPassword,
  checkResetCode,
  changePassword,
  changePasswordAuthenticated,
  refreshToken,
  changeName,
  changeTitle,
  checkUser,
  uploadProfileImage,
  logout,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/refresh-token", refreshToken);
router.post("/forget-password", forgetPassword);
router.post("/check-resetcode", checkResetCode);
router.post("/change-password", changePassword);
router.post(
  "/upload-profile-image",
  verifyToken,
  upload.single("profile_image"),
  uploadProfileImage
);

router.post("/change-password-auth", verifyToken, changePasswordAuthenticated);
router.put("/change-name", verifyToken, changeName);
router.put("/change-title", verifyToken, changeTitle);

router.get("/check", verifyToken, checkUser);
// Logout: clear auth cookies (supports both GET and POST)
router.get("/logout", logout);
router.post("/logout", logout);

export default router;
