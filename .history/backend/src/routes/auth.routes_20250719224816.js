import express from "express";
import {
    signUp,
    signIn,
    forgetPassword,
    checkResetCode,
    changePassword,
    changePasswordAuthenticated
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.js";
import logger from "../utils/logger.js";

const router = express.Router();

// Logging middleware
const logAuthRequest = (req, res, next) => {
    logger.auth(req.path.substring(1), `Request from ${req.ip}`);
    next();
};

// Public routes
router.post("/sign-up", logAuthRequest, signUp);
router.post("/sign-in", logAuthRequest, signIn);
router.post("/forget-password", logAuthRequest, forgetPassword);
router.post("/check-resetcode", logAuthRequest, checkResetCode);
router.post("/change-password", logAuthRequest, changePassword);

// Protected routes
router.post("/change-password-auth", logAuthRequest, verifyToken, changePasswordAuthenticated);

export default router;

