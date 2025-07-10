import client from "../lib/db.js";
import moment from "moment";
import jwt from "jsonwebtoken";

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

};

export const sendMessage = async (req, res) => {

};
