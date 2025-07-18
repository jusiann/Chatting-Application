import client from "../lib/db.js";
import bcrypt from "bcrypt";
import {createToken} from "../middlewares/auth.js";
import crypto from "crypto";
import moment from "moment";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import {ApiError} from "../middlewares/error.js";

export const signUp = async (req, res, next) => {
    try {
        const {name, surname, email, password} = req.body;
        
        if (!name || !surname || !email || !password)
            throw new ApiError("Name, Surname, Email and Password are required.", 400);

        const checkUser = await client.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if(checkUser.rows.length > 0)
            throw new ApiError("Email already exists!", 400);

        const hashedPassword = await bcrypt.hash(password, 8);
        // console.log("Hashed Password: ", hashedPassword);

        await client.query(`
            INSERT INTO users (name, surname, email, password) 
            VALUES ($1, $2, $3, $4)`,
            [name, surname, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "User created successfully!"
        });
    } catch (error) {
        next(error);
    }
};

export const signIn = async (req, res, next) => {
   try {
        const { email, password } = req.body;
        
        if (!email || !password)
            throw new ApiError("Email and Password are required.", 400);

        const checkUser = await client.query(`
            SELECT * FROM users 
            WHERE email = $1`,
            [email]
        );

        if (checkUser.rows.length === 0)
            throw new ApiError("Email or Password is incorrect!", 401);
        
        const user = checkUser.rows[0];
        // console.log("Request password:", password);
        // console.log("DB password hash:", user.password);

        const comparePassword = await bcrypt.compare(password, user.password);

        if (!comparePassword)
            throw new ApiError("Email or Password is incorrect!", 401);

        await createToken(user, res);
    } catch (error) {
        next(error);
    }
};

export const forgetPassword = async (req, res, next) => {
    try {
        const {email} = req.body;
        if (!email)
            throw new ApiError("Email is required.", 400);

        const checkUser = await client.query(`
            SELECT id, name, surname, email FROM users 
            WHERE email = $1`,
            [email]
        );

        if(!checkUser.rows.length > 0) 
            throw new ApiError("User does not exist!", 404);
    
        const resetCode = crypto.randomBytes(16).toString("hex");
        // console.log("User: ", checkUser.rows[0]);
        // console.log("Reset Code: ", resetCode);

        const resetTime = new Date().toISOString();

        await client.query(`
            UPDATE users SET reset_code = $1, reset_time = $2 
            WHERE email = $3`,
            [resetCode, resetTime, email]
        );

        const mailText = `
            Merhaba ${checkUser.rows[0].name},\n
            Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:\n
            ${resetCode}\n
            Bu kod 15 dakika boyunca geçerlidir.\n
            Eğer bu işlemi siz başlatmadıysanız bu mesajı yok sayabilirsiniz.`;

        await sendEmail(email, "Şifre Sıfırlama Talebi", mailText);

        res.status(200).json({
            success: true,
            message: "Reset code sent to your email.",
            reset_code: resetCode
        });
    } catch (error) {
        next(error);
    }
};

export const checkResetCode = async (req, res, next) => {
    try {
        const { email, reset_code } = req.body;
        if (!email || !reset_code)
            throw new ApiError("Email and reset code are required.", 400);

        const userCheck = await client.query(`
            SELECT id, email, reset_code, reset_time FROM users 
            WHERE email = $1`,
            [email]
        );

        if (userCheck.rows.length === 0)
            throw new ApiError("User not found!", 404);
        

        const user = userCheck.rows[0];

        if (!user.reset_code || !user.reset_time)
            throw new ApiError("No active password reset request found.", 400);
        

        const timeDB = moment.utc(user.reset_time);
        const timeNow = moment.utc();
        // console.log("timeDB (UTC):", timeDB.format());
        // console.log("timeNow (UTC):", timeNow.format());

        const differenceInMinutes = timeNow.diff(timeDB, 'minutes');
        // console.log("Difference in minutes:", differenceInMinutes);

        if (differenceInMinutes >= process.env.RESETCODE_EXPIRES_IN)
            throw new ApiError("Reset code has expired! Please request a new one.", 401);
        

        if (String(user.reset_code) !== String(reset_code))
            throw new ApiError("Invalid reset code!", 400);
        

        await client.query(`
            UPDATE users SET reset_code = NULL, reset_time = NULL 
            WHERE id = $1`,
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
            message: "Reset code verified successfully.",
            token: token
        });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if (!email || !password)
            throw new ApiError("Email, Password and Token are required.", 400);
        

        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_TEMPORARY_KEY);
        
        if(decoded.type !== "reset")
            throw new ApiError("Invalid token type!", 401);

        const hashedPassword = await bcrypt.hash(password, 8);
        await client.query(`
            UPDATE users SET password = $1, reset_code = NULL, reset_time = NULL 
            WHERE id = $2`,
            [hashedPassword, decoded.sub]
        );

        res.status(200).json({
            success: true,
            message: "Password changed successfully!"
        });
    } catch (error) {
        if(error instanceof jwt.JsonWebTokenError)
            next(new ApiError("Invalid or expired token", 401));
        else
            next(error);
    }
};

export const changePasswordAuthenticated = async (req, res, next) => {
    try {
        const {currentPassword, newPassword} = req.body;
        if (!currentPassword || !newPassword)
            throw new ApiError("Current password and new password are required.", 400);

        const user = req.user;
        const checkUser = await client.query(`
            SELECT password FROM users 
            WHERE id = $1`,
            [user.id]
        );

        const dbPassword = checkUser.rows[0].password;
        const comparePassword = await bcrypt.compare(currentPassword, dbPassword);
        
        if (!comparePassword)
            throw new ApiError("Current password is incorrect!", 401);
        

        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await client.query(`
            UPDATE users SET password = $1 
            WHERE id = $2`,
            [hashedPassword, user.id]
        );

        res.status(200).json({
            success: true,
            message: "Password changed successfully!"
        });
    } catch (error) {
        next(error);
    }
};
