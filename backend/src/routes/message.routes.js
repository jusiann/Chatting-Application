import express from "express";
import { getUsers, getMessages, sendMessage, markDelivered, unreadCount} from "../controllers/message.controller.js";
import {verifyToken} from "../middlewares/auth.js";

const router = express.Router();

router.get("/users", verifyToken, getUsers);
router.get("/:id", verifyToken, getMessages);
router.post("/send/:id", verifyToken, sendMessage);
router.post("/mark-delivered", verifyToken, markDelivered);
router.get("/unread-count", verifyToken, unreadCount);
export default router;
