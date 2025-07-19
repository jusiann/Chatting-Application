import client from "../lib/db.js";
import moment from "moment";
import { ApiError } from "../middlewares/error.js";
import logger from "../utils/logger.js";

export const getUsers = async (req, res) => {
    try{
        const currentUser = req.user;
        const users = await client.query(`select id, fullname, email, title, department, profilepic from users where id != $1`,[currentUser.id]);
        return res.status(200).json(users.rows);
    }
    catch(err){
        console.log(err);
        return res.status(401).json({message:'Token çözülürken bir sorun oluştu.'});
    }
}

export const getMessagesUsers = async (req, res) => {
    try {
        const currentUser = req.user;
        const users = await client.query(`WITH ranked_messages AS (
                                            SELECT *,
                                                    CASE
                                                    WHEN sender_id = $1 THEN receiver_id
                                                    ELSE sender_id
                                                    END AS chat_partner_id,
                                                    ROW_NUMBER() OVER (
                                                    PARTITION BY CASE
                                                                    WHEN sender_id = $1 THEN receiver_id
                                                                    ELSE sender_id
                                                                    END
                                                    ORDER BY createdat DESC
                                                    ) AS rn
                                            FROM messages
                                            WHERE senderid = $1 OR receiverid = $1
                                            )
                                            SELECT 
                                            u.id,
                                            u.fullname,
                                            u.title,
                                            u.department,
                                            u.email,
                                            u.profilepic,
                                            r.content AS last_message,
                                            r.created_at AS last_message_time,
                                            r.sender_id AS message_sender,
                                            r.status AS message_status
                                            FROM ranked_messages r
                                            JOIN users u ON u.id = r.chat_partner_id
                                            WHERE r.rn = 1
                                            ORDER BY r.createdat DESC;`, [currentUser.id]);
        return res.status(200).json(users.rows);
    } 
    catch (err) {
        console.log(err);
        return res.status(400).json({message: err});
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
