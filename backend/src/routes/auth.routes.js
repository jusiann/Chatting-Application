
import express from "express";
import {signUp, signIn, forgetPassword, checkResetCode, changePassword, changePasswordAuthenticated} from "../controllers/auth.controller.js";
import {verifyToken} from "../middlewares/auth.js";

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/forget-password", forgetPassword);
router.post("/check-resetcode", checkResetCode);
router.post("/change-password", changePassword);
router.post("/change-password-auth", verifyToken, changePasswordAuthenticated);

export default router

