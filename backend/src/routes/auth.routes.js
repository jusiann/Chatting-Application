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
  fcmToken,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Login rate limit
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 5, // 1 dakikada max 5 istek
  message: "Too many login attempts. Please try again later.",
});

// Signup rate limit
export const signupLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 3, // 1 dakikada max 3 signup
  message: "Too many signup attempts. Please try again later.",
});

router.post("/sign-up", signupLimiter, signUp);
router.post("/sign-in", loginLimiter, signIn);
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
router.post("/fcm-token", verifyToken, fcmToken);

router.post("/change-password-auth", verifyToken, changePasswordAuthenticated);
router.put("/change-name", verifyToken, changeName);
router.put("/change-title", verifyToken, changeTitle);

router.get("/check", verifyToken, checkUser);
// Logout: clear auth cookies (supports both GET and POST)
router.get("/logout/:id", logout);
router.post("/logout", logout);

export default router;
