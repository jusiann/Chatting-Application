import client from "../lib/db.js";
import moment from "moment";
import { ApiError } from "../middlewares/error.js";

const MESSAGE_STATUS = {
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read'
};

export const getUsers = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const usersList = await client.query(`
            SELECT id, first_name, last_name, email, title, department, profile_pic 
            FROM users 
            WHERE id != $1`,
            [userId]
        );
        res.status(200).json({
            success: true,
            users: usersList.rows
        });
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const otherID = req.params.id;
        if (!otherID)
            throw new ApiError("Recipient ID is required.", 400);

        await client.query(`
            UPDATE messages 
            SET status = $1 
            WHERE sender_id = $2 AND receiver_id = $3 AND status != $1`,
            [MESSAGE_STATUS.READ, otherID, userId]
        );

        const messages = await client.query(`
            SELECT 
                m.*,
                json_build_object(
                    'id', s.id,
                    'first_name', s.first_name,
                    'last_name', s.last_name,
                    'profile_pic', s.profile_pic
                ) as sender,
                json_build_object(
                    'id', r.id,
                    'first_name', r.first_name,
                    'last_name', r.last_name,
                    'profile_pic', r.profile_pic
                ) as receiver
            FROM messages m
            JOIN users s ON m.sender_id = s.id
            JOIN users r ON m.receiver_id = r.id
            WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
               OR (m.sender_id = $2 AND m.receiver_id = $1)
            ORDER BY m.created_at DESC`,
            [userId, otherID]
        );

        res.status(200).json({
            success: true,
            messages: messages.rows
        });
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const receiverId = req.params.id;
        const { content } = req.body;

        if (!content || content.trim().length === 0)
            throw new ApiError("Message content is required.", 400);

        const receiver = await client.query(`
            SELECT id FROM users 
            WHERE id = $1`,
            [receiverId]
        );
        if (receiver.rows.length === 0)
            throw new ApiError("Recipient not found.", 404);

        const newMessage = await client.query(`
            INSERT INTO messages (
                sender_id, 
                receiver_id, 
                content, 
                status, 
                created_at
            ) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [userId, receiverId, content, MESSAGE_STATUS.SENT, moment().format()]
        );

        const messageWithDetails = await client.query(`
            SELECT 
                m.*,
                json_build_object(
                    'id', s.id,
                    'first_name', s.first_name,
                    'last_name', s.last_name,
                    'profile_pic', s.profile_pic
                ) as sender,
                json_build_object(
                    'id', r.id,
                    'first_name', r.first_name,
                    'last_name', r.last_name,
                    'profile_pic', r.profile_pic
                ) as receiver
            FROM messages m
            JOIN users s ON m.sender_id = s.id
            JOIN users r ON m.receiver_id = r.id
            WHERE m.id = $1`,
            [newMessage.rows[0].id]
        );

        res.status(201).json({
            success: true,
            message: "Message sent successfully.",
            data: messageWithDetails.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

export const markDelivered = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const undeliveredMessages = await client.query(`
            SELECT DISTINCT ON (m.sender_id)
                m.sender_id,
                u.first_name,
                u.last_name,
                COUNT(*) OVER (PARTITION BY m.sender_id) as message_count
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.receiver_id = $1 
            AND m.status = $2`,
            [userId, MESSAGE_STATUS.SENT]
        );

        if (undeliveredMessages.rows.length === 0)
            return res.status(200).json({
                success: true,
                message: "No new messages to deliver.",
                data: {
                    updated_count: 0,
                    senders: []
                }
            });
    
        const updateResult = await client.query(`
            UPDATE messages 
            SET status = $1, delivered_at = NOW()
            WHERE receiver_id = $2 
            AND status = $3
            RETURNING id`,
            [MESSAGE_STATUS.DELIVERED, userId, MESSAGE_STATUS.SENT]
        );

        const senders = undeliveredMessages.rows.map(row => ({
            id: row.sender_id,
            name: `${row.first_name} ${row.last_name}`,
            undelivered_count: parseInt(row.message_count)
        }));

        res.status(200).json({
            success: true,
            message: "Messages marked as delivered successfully",
            data: {
                total_updated: updateResult.rows.length,
                senders: senders,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        next(error);
    }
};

export const unreadCount = async (req, res, next) => {
    const userId = req.user.id;
    const { rows } = await client.query(`select sender_id, Count(*) as count from messages where receiver_id = $1 and status != 'read' group by sender_id`, [userId]);
    const counts = {};
    for(const row of rows){
        counts[row.sender_id] = parseInt(row.count);
    }
    res.status(200).json(counts);
};

export const getLastMessages = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const usersList = await client.query(`
            SELECT id, first_name, last_name, email, title, department, profile_pic 
            FROM users 
            WHERE id != $1`,
            [userId]
        );

        if (!usersList.rows) 
            throw new ApiError("No users found", 404);
        

        const usersWithLastMessage = await Promise.all(usersList.rows.map(async (user) => {
            const lastMessage = await client.query(`
                SELECT m.*, 
                    json_build_object(
                        'id', s.id,
                        'first_name', s.first_name,
                        'last_name', s.last_name
                    ) as sender
                FROM messages m
                JOIN users s ON m.sender_id = s.id
                WHERE (m.sender_id = $1 AND m.receiver_id = $2)
                   OR (m.sender_id = $2 AND m.receiver_id = $1)
                ORDER BY m.created_at DESC
                LIMIT 1`,
                [userId, user.id]
            );

            return {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                profile_pic: user.profile_pic,
                title: user.title,
                department: user.department,
                lastMessage: lastMessage.rows[0] ? {
                    id: lastMessage.rows[0].id,
                    sender: lastMessage.rows[0].sender.id,
                    content: lastMessage.rows[0].content,
                    created_at: lastMessage.rows[0].created_at,
                    status: lastMessage.rows[0].status
                } : null
            };
        }));

        res.status(200).json({
            success: true,
            data: usersWithLastMessage
        });
    } catch (error) {
        next(error);
    }
};