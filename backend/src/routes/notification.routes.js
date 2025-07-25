import express from 'express';
import {verifyToken} from '../middlewares/auth.js';
import {getNotifications, markAsRead, deleteNotifications, getUnreadCount} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.delete('/', verifyToken, deleteNotifications);
router.get('/unread-count', verifyToken, getUnreadCount);
router.put('/mark-read', verifyToken, markAsRead);

export default router; 