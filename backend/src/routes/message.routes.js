import express from "express";
import {getUsers, getMessages, sendMessage, markDelivered, unreadCount} from "../controllers/message.controller.js";
import {verifyToken} from "../middlewares/auth.js";

const router = express.Router();

router.get("/users", verifyToken, getUsers);
router.get("/unread-count", verifyToken, unreadCount);
router.post("/mark-delivered", verifyToken, markDelivered);
router.get("/:id", verifyToken, getMessages);
router.post("/send/:id", verifyToken, sendMessage);

export default router;
