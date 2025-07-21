import client from "../lib/db.js";
import moment from "moment";

export const getUsers = async (req, res) => {
    try {
        const userId = req.user.id;
        const usersList = await client.query(`
            SELECT id, first_name, last_name, email, title, department, profile_pic FROM users 
            WHERE id != $1`,
            [userId]
        );

        res.status(200).json({
            success: true,
            users: usersList.rows
        });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users."
        });
    }
};

export const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherID = req.params.id;
        if (!otherID)
            return res.status(400).json({
                success: false,
                message: "Recipient ID is required."
            });

        await client.query(`
            UPDATE messages SET status = 'read' 
            WHERE sender_id = $1 AND receiver_id = $2 AND status = 'unread'`,
            [otherID, userId]
        );

        const resultMessage = await client.query(`
            SELECT * FROM messages 
            WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) 
            ORDER BY created_at DESC`,
            [userId, otherID]
        );

        if(resultMessage.rows.length === 0)
            return res.status(404).json({
                success: false,
                message: "No messages found."
            });
        
        res.status(200).json({
            success: true,
            messages: resultMessage.rows
        });
    } catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get messages."
        });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherID = req.params.id;
        const {content} = req.body;

        if(!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message content is required."
            });
        }

        const checkOtherUser = await client.query(`
            SELECT id FROM users WHERE id = $1`,
            [otherID]
        );

        if (checkOtherUser.rows.length === 0)
            return res.status(404).json({
                success: false,
                message: "Recipient not found."
            });

        const resultMessage = await client.query(`
            INSERT INTO messages (sender_id, receiver_id, content, status, created_at) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, otherID, content, 'unread', moment().format()]
        );

        res.status(201).json({
            success: true,
            message: "Message sent successfully.",
            data: resultMessage.rows[0]
        });
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message."
        });
    }
};

export const markDelivered = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await client.query(`
            UPDATE messages 
            SET status = 'delivered', delivered_at = NOW()
            WHERE receiver_id = $1 AND status = 'sent'
            RETURNING id, sender_id, delivered_at`, 
            [userId]
        );

        if(result.rows.length === 0)
            return res.status(200).json({
                success: true,
                message: "No new messages to mark as delivered.",
                deliveredMessageIds: []
            });
        
        res.status(200).json({
            success: true,
            message: "Messages marked as delivered successfully",
            //deliveredMessageIds: result.rows.map(row => row.id),
            senderIds: result.rows.map(row => row.sender_id),
            deliveredAt: result.rows[0].delivered_at
        });
    } catch (error) {
        console.error("Mark delivered error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark message as delivered."
        });
    }
};

export const unreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await client.query(`
            SELECT sender_id, COUNT(*) as count 
            FROM messages 
            WHERE receiver_id = $1 AND status = 'unread' 
            GROUP BY sender_id`, 
            [userId]
        );

        const unreadCountBySender = {};
        for(const row of result.rows)
            unreadCountBySender[row.sender_id] = parseInt(row.count);

        res.status(200).json({
            success: true,
            unreadCounts: unreadCountBySender
        });
    } catch (error) {
        console.error("Get unread count error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get unread message counts."
        });
    }
};