import client, {NOTIFICATION_TYPES} from '../lib/db.js';
import { ApiError } from '../middlewares/error.js';

export const createNotification = async ({ userId, senderId, type, content, data = {} }) => {
    if (!Object.values(NOTIFICATION_TYPES).includes(type))
        throw new ApiError(`Invalid notification type: ${type}`, 400);
    
    const userCheck = await client.query(`
        SELECT id FROM users 
        WHERE id = $1`,
        [userId]
    );
    if (userCheck.rows.length === 0)
        throw new ApiError(`User not found with id: ${userId}`, 404);
   
    const result = await client.query(`
        INSERT INTO notifications (
            user_id, sender_id, type, content, data
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING 
            id, 
            user_id, 
            sender_id, 
            type, 
            content, 
            data, 
            is_read, 
            created_at`,
        [userId, senderId, type, content, JSON.stringify(data)]
    );

    const notification = result.rows[0];
    if (senderId) {
        const senderDetails = await client.query(`
            SELECT id, first_name, last_name, profile_pic 
            FROM users 
            WHERE id = $1`,
            [senderId]
        );

        if (senderDetails.rows.length > 0)
            notification.sender = senderDetails.rows[0];
    }

    const userSocket = global.connectedUsers?.get(userId);
    if (userSocket)
        userSocket.emit('new_notification', notification);
    
    return notification;
};

export const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0, unreadOnly = false } = req.query;
        let query = `
            SELECT 
                n.*,
                json_build_object(
                    'id', u.id,
                    'first_name', u.first_name,
                    'last_name', u.last_name,
                    'profile_pic', u.profile_pic
                ) as sender
            FROM notifications n
            LEFT JOIN users u ON n.sender_id = u.id
            WHERE n.user_id = $1`;
        
        if (unreadOnly === 'true')
            query += ' AND n.is_read = false';
        
        query += ' ORDER BY n.created_at DESC LIMIT $2 OFFSET $3';
       
        const result = await client.query(query, [userId, limit, offset]);
        const countResult = await client.query(`
            SELECT COUNT(*) FROM notifications 
            WHERE user_id = $1` + (unreadOnly === 'true' ? ' AND is_read = false' : ''),
            [userId]
        );

        res.status(200).json({
            success: true,
            data: {
                notifications: result.rows,
                total: parseInt(countResult.rows[0].count),
                unread: result.rows.filter(n => !n.is_read).length
            }
        });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { notification_ids } = req.body;
        if (!notification_ids || !Array.isArray(notification_ids))
            throw new ApiError('Notification IDs are required', 400);
        
        const result = await client.query(`
            UPDATE notifications 
            SET is_read = true, read_at = NOW()
            WHERE id = ANY($1) AND user_id = $2
            RETURNING *`,
            [notificationIds, userId]
        );
        
        res.status(200).json({
            success: true,
            data: {
                updated: result.rows,
                count: result.rows.length
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { notificationIds } = req.body;
        if (!notificationIds || !Array.isArray(notificationIds))
            throw new ApiError('Notification IDs are required', 400);
        
        await client.query(`
            DELETE FROM notifications 
            WHERE id = ANY($1) AND user_id = $2`,
            [notificationIds, userId]
        );
        
        res.status(200).json({
            success: true,
            message: 'Notifications deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await client.query(`
            SELECT COUNT(*) 
            FROM notifications 
            WHERE user_id = $1 AND is_read = false`,
            [userId]
        );
        
        res.status(200).json({
            success: true,
            data: {
                unread_count: parseInt(result.rows[0].count)
            }
        });
    } catch (error) {
        next(error);
    }
}; 