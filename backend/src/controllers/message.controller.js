import client from "../lib/db.js";
import moment from "moment";
import { ApiError } from "../middlewares/error.js";
import logger from "../utils/logger.js";

export const getUsersForSidebar = async (req, res, next) => {
    try {
        const id = req.user.id;
        const usersList = await client.query(`
            SELECT id, name, surname, email FROM users 
            WHERE id != $1`,
            [id]
        );

        const usersWithMessages = [];

        for(const user of usersList.rows) {
            const lastMessages = await client.query(`
                SELECT content, created_at, sender_id
                FROM messages
                WHERE (sender_id = $1 AND receiver_id = $2)
                OR (sender_id = $2 AND receiver_id = $1)
                ORDER BY created_at DESC
                LIMIT 1`,
                [id, user.id]
            );

            const lastMessage = lastMessages.rows[0];
            usersWithMessages.push({
                ...user,
                lastMessage: lastMessage ? {
                    sender_id: lastMessage.sender_id,
                    content: lastMessage.content,
                    created_at: moment(lastMessage.created_at).format("HH:mm")
                } : null
            });
        }

        res.status(200).json({
            success: true,
            users: usersWithMessages
        });
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const myID = req.user.id;
        const otherID = req.params.id;

        if (!otherID)
            throw new ApiError("User ID is required", 400);
        
        const resultMessage = await client.query(`
            SELECT * FROM messages 
            WHERE (sender_id = $1 AND receiver_id = $2) 
               OR (sender_id = $2 AND receiver_id = $1) 
            ORDER BY created_at DESC`,
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
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const myID = req.user.id;
        const otherID = req.params.id;
        const {content} = req.body;

        logger.info(`User ${myID} attempting to send message to user ${otherID}`);

        if (!otherID) {
            logger.info(`Message failed - No recipient specified by user ${myID}`);
            throw new ApiError("Recipient ID is required", 400);
        }
        
        if(!content || content.trim().length === 0) {
            logger.info(`Message failed - Empty message from user ${myID}`);
            throw new ApiError("Message content is required", 400);
        }

        const checkOtherUser = await client.query(
            "SELECT id FROM users WHERE id = $1",
            [otherID]
        );

        if (checkOtherUser.rows.length === 0) {
            logger.info(`Message failed - Recipient ${otherID} not found for sender ${myID}`);
            throw new ApiError("Recipient not found", 404);
        }

        const resultMessage = await client.query(`
            INSERT INTO messages (sender_id, receiver_id, content, created_at) 
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [myID, otherID, content, moment().format()]
        );

        logger.info(`Message sent successfully from user ${myID} to user ${otherID}`);

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: resultMessage.rows[0]
        });
    } catch (error) {
        logger.error(`Message error from user ${req.user?.id}: ${error.message}`);
        next(error);
    }
};
