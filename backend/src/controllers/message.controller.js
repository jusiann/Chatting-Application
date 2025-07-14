import client from "../lib/db.js";
import moment from "moment";

export const getUsersForSidebar = async (req, res) => {
    try {
        const id = req.user.id;
        const usersList = await client.query(
            "SELECT id, name, surname, email FROM users WHERE id != $1",
            [id]
        );

        res.status(200).json({
            success: true,
            users: usersList.rows
        });
    } catch (error) {
        console.error("Get users erroṙ:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users."
        });
    }
};

export const getMessages = async (req, res) => {
    try {
        const myID = req.user.id;
        const otherID = req.params.id;
        const resultMessage = await client.query(
            "SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at DESC",
            [myID, otherID]
        );

        if(resultMessage.rows.length === 0)
            return res.status(400).json({
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
        const myID = req.user.id;
        const otherID = req.params.id;
        const {content} = req.body;
        if(!content || content.trim().length === 0)
            return res.status(400).json({
                success: false,
                message: "Message content is required."
            });

        const resultMessage = await client.query(
            "INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES ($1, $2, $3, $4) RETURNING *",
            [myID, otherID, content, moment().format()]
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
