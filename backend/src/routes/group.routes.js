import express from "express";
import {createGroup, sendGroupMessage, getUserGroupsWithLastMessages, getGroupMessages, getGroupMembers} from "../controllers/group.controller.js";
import {verifyToken} from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", verifyToken, createGroup);
router.post("/:groupId/message", verifyToken, sendGroupMessage);
router.get("/user-groups", verifyToken, getUserGroupsWithLastMessages);
router.get("/:groupId/messages", verifyToken, getGroupMessages);
router.get("/:groupId/members", verifyToken, getGroupMembers);

export default router;