
import express from "express";
import {signup, signin, forgetpassword, checkResetCode, changepassword} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/forgetpassword", forgetpassword);
router.post("/checkresetcode", checkResetCode);
router.post("/changepassword", changepassword);

export default router;

