import express from "express";
import multer from "multer";
import path from "path";
import {signUp, signIn, forgetPassword, checkResetCode, changePassword, changePasswordAuthenticated, refreshToken, changeName, changeTitle, changeProfilePicture} from "../controllers/auth.controller.js";
import {verifyToken} from "../middlewares/auth.js";


const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile-pictures/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/refresh-token", refreshToken);
router.post("/forget-password", forgetPassword);
router.post("/check-reset-code", checkResetCode);
router.post("/change-password", changePassword);

router.post("/change-password-auth", verifyToken, changePasswordAuthenticated);
router.put("/change-name", verifyToken, changeName);
router.put("/change-title", verifyToken, changeTitle);
router.put("/change-profile-picture", verifyToken, upload.single('profile_picture'), changeProfilePicture);

export default router;

