import express from "express";
import {
  getUsers,
  getMessages,
  sendMessage,
  markDelivered,
  unreadCount,
  getLastMessages,
  uploadUrl,
} from "../controllers/message.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/users", verifyToken, getUsers);
router.get("/last-messages", verifyToken, getLastMessages);
router.get("/unread-count", verifyToken, unreadCount);
router.post("/mark-delivered", verifyToken, markDelivered);
router.post("/send/:id", verifyToken, sendMessage);
router.post("/upload-url", verifyToken, uploadUrl);
router.get("/:id", verifyToken, getMessages);

export default router;
