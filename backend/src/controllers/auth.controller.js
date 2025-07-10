import client from "../lib/db.js";
import bcrypt from "bcrypt";
import {createToken} from "../middlewares/auth.js";
import crypto from "crypto";
import moment from "moment";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

export const signUp = async (req ,res) => {
    try {
        const {name, surname, email, password} = req.body;
        if (!name || !surname || !email || !password)
            return res.status(400).json({
                success: false,
                message: "Name, Surname, Email and Password are required."
            });

        const checkUser = await client.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if(checkUser.rows.length > 0)
            return res.status(400).json({
                success: false,
                message: "Email already exists!"
            });

        const hashedPassword = await bcrypt.hash(password, 8);
        // console.log("Hashed Password: ", hashedPassword);

        await client.query(
            "INSERT INTO users (name, surname, email, password) VALUES ($1, $2, $3, $4)",
            [name, surname, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "User created!!"
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            success: false,
            message: "User cannot created!!"
        });
    }
};

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({
                success: false,
                message: "Email and Password are required."
            });

        const checkUser = await client.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (checkUser.rows.length === 0)
            return res.status(400).json({
                success: false,
                message: "Email or Password is wrong!"
            });

        const user = checkUser.rows[0];
        // console.log("Request password:", password);
        // console.log("DB password hash:", user.password);

        const comparePassword = await bcrypt.compare(password, user.password);

        if (!comparePassword)
            return res.status(401).json({
                success: false,
                message: "Password is wrong!"
            });

        await createToken(user, res);
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({
            success: false,
            message: "Signin failed!"
        });
    }
};

export const forgetPassword = async (req, res) => {
    try {
        const {email} = req.body;
        if (!email)
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });

        const checkUser = await client.query(
            "SELECT id, name, surname, email FROM users WHERE email = $1",
            [email]
        );

        if(!checkUser.rows.length > 0)
            return res.status(400).json({
                success: false,
                message: "User does not exist!"
            });

        const resetCode = crypto.randomBytes(16).toString("hex");
        // console.log("User: ", checkUser.rows[0]);
        // console.log("Reset Code: ", resetCode);

        const resetTime = new Date().toISOString();

        await client.query(
            "UPDATE users SET reset_code = $1, reset_time = $2 WHERE email = $3",
            [resetCode, resetTime, email]
        );

        const mailText = `
            Merhaba ${checkUser.name},\n
            Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:\n\n
            Bu bağlantı 15 dakika boyunca geçerlidir.\n
            Eğer bu işlemi siz başlatmadıysanız bu mesajı yok sayabilirsiniz.
            `;

        await sendEmail(email, "Şifre Sıfırlama Talebi", mailText);

        res.status(200).json({
            success: true,
            message: "Reset code generated.",
            reset_code: resetCode
        });
    } catch (error) {
        console.error("Forget password error:", error);
        res.status(500).json({
            success: false,
            message: "Forget password failed!"
        });
    }
};

export const checkResetCode = async (req, res) => {
    try {
        const { email, reset_code } = req.body;
        if (!email || !reset_code)
            return res.status(400).json({
                success: false,
                message: "Email and reset code are required."
            });

        const userCheck = await client.query(
            "SELECT id, email, reset_code, reset_time FROM users WHERE email = $1",
            [email]
        );

        if (userCheck.rows.length === 0)
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });

        const user = userCheck.rows[0];

        if (!user.reset_code || !user.reset_time)
            return res.status(400).json({
                success: false,
                message: "No active password reset request found for this user."
            });

        const timeDB = moment.utc(user.reset_time);
        const timeNow = moment.utc();
        // console.log("timeDB (UTC):", timeDB.format());
        // console.log("timeNow (UTC):", timeNow.format());

        const differenceInMinutes = timeNow.diff(timeDB, 'minutes');
        // console.log("Difference in minutes:", differenceInMinutes);

        if (differenceInMinutes >= process.env.RESETCODE_EXPIRES_IN)
            return res.status(401).json({
                success: false,
                message: "Reset code expired! Please request a new one."
            });

        if (String(user.reset_code) !== String(reset_code))
            return res.status(400).json({
                success: false,
                message: "Reset code does not match!",
            });

        await client.query(
            "UPDATE users SET reset_code = NULL, reset_time = NULL WHERE id = $1",
            [user.id]
        );

        const payload = {
            sub: user.id,
            email: user.email,
            type: "reset"
        };

        const token = jwt.sign(payload, process.env.JWT_TEMPORARY_KEY, {
            expiresIn: process.env.JWT_TEMPORARY_EXPIRES_IN || '5m'
        });

        res.status(200).json({
            success: true,
            message: "Reset code verified successfully. You can now set a new password.",
            token: token
        });
    } catch (error) {
        console.error("Error in checkResetCode:", error);
        res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later."
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password)
            return res.status(400).json({
                success: false,
                message: "Email, Password and Token are required."
            });

        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_TEMPORARY_KEY);
        if(decoded.type !== "reset")
            return res.status(401).json({
                success: false,
                message: "Invalid token!"
            });
        // console.log("Decoded: ", decoded);

        const hashedPassword = await bcrypt.hash(password, 8);
        await client.query(
            "UPDATE users SET password = $1, reset_code = NULL, reset_time = NULL WHERE id = $2",
            [hashedPassword, decoded.sub]
        );

        res.status(200).json({
            success: true,
            message: "Password has been changed successfully!"
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(400).json({
            success: false,
            message: "Invalid token or other error."
        });
    }
};

export const changePasswordAuthenticated = async (req, res) => {
    try {
        const {currentPassword, newPassword} = req.body;
        if (!currentPassword || !newPassword)
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required."
            });

        const user = req.user;
        const checkUser = await client.query(
            "SELECT password FROM users WHERE id = $1",
            [user.id]
        );

        const dbPassword = checkUser.rows[0].password;
        const comparePassword = await bcrypt.compare(currentPassword, dbPassword);
        if (!comparePassword)
            return res.status(401).json({
                success: false,
                message: "Current password is wrong!"
            });

        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await client.query(
            "UPDATE users SET password = $1 WHERE id = $2",
            [hashedPassword, user.id]
        );

        res.status(200).json({
            success: true,
            message: "Password has been changed successfully!"
        });
    } catch (error) {
        console.error("Change password authenticated error:", error);
        res.status(401).json({
            success: false,
            message: "Authentication failed!"
        })
    }
};
