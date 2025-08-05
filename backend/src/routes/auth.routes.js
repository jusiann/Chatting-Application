import express from "express";
import {signUp, signIn, forgetPassword, checkResetCode, changePassword, changePasswordAuthenticated, refreshToken, changeName, changeTitle, changeProfilePicture, checkUser} from "../controllers/auth.controller.js";
import { uploadProfilePicture, handleUploadError, handleCloudinaryUpload } from "../middlewares/multer.js";
import {verifyToken} from "../middlewares/auth.js";

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/refresh-token", refreshToken);
router.post("/forget-password", forgetPassword);
router.post("/check-resetcode", checkResetCode);
router.post("/change-password", changePassword);

router.post("/change-password-auth", verifyToken, changePasswordAuthenticated);
router.put("/change-name", verifyToken, changeName);
router.put("/change-title", verifyToken, changeTitle);
router.put("/change-profile-picture", 
    verifyToken, 
    uploadProfilePicture,
    handleUploadError,
    handleCloudinaryUpload,
    changeProfilePicture
);

router.post("/test-upload", 
    verifyToken, 
    uploadProfilePicture,
    handleUploadError,
    handleCloudinaryUpload,
    (req, res) => {
        try {
            if (!req.cloudinary) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded"
                });
            }

            res.status(200).json({
                success: true,
                message: "File uploaded successfully",
                profile_pic: req.cloudinary.url
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error uploading file",
                error: error.message
            });
        }
    }
);

router.get("/check", verifyToken, checkUser);

export default router;

