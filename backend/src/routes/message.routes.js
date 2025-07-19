import express from "express";
import { getMessages, sendMessage, getMessagesUsers, getUsers} from "../controllers/message.controller.js";
import {verifyToken} from "../middlewares/auth.js";

const router = express.Router();

router.get("/users", verifyToken, getUsers);
router.get("/messageUsers", verifyToken, getMessagesUsers);
router.get("/:id", verifyToken, getMessages);
router.post("/send/:id", verifyToken, sendMessage);

export default router;
