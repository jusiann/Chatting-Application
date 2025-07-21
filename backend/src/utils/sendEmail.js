import dotenv from "dotenv";
import nodemailer from 'nodemailer';
import { ApiError } from "../middlewares/error.js";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendEmail = async (to, subject, text, html = null) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new ApiError("Email configuration is missing", 500);
    }

    const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text,
        html: html || text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("[EMAIL] Sent successfully to:", to);
    } catch (error) {
        console.error("[EMAIL] Failed to send:", error.message);
        throw new ApiError("Failed to send email", 500);
    }
};

export default sendEmail;