import client from "../lib/db.js";
import bcrypt from "bcrypt";
import {createToken} from "../middlewares/auth.js";
import crypto from "crypto";
import moment from "moment";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import {ApiError} from "../middlewares/error.js";
import logger from "../utils/logger.js";

export const signUp = async (req, res, next) => {
    try {
        const {fullname, email, password, title, department} = req.body;
        logger.info(`Attempting to register new user: ${email}`);

        if (!fullname || !email || !password ) {
            logger.warn(`Registration failed - Missing required fields for user: ${email}`);
            throw new ApiError("Fullname, Email, Password are required.", 400);
        }

        const checkUser = await client.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if(checkUser.rows.length > 0) {
            logger.warn(`Registration failed - Email already exists: ${email}`);
            throw new ApiError("Email already exists!", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        // console.log("Hashed Password: ", hashedPassword);

        const result = await client.query(`
            INSERT INTO users (fullname, email, password, title, department) 
            VALUES ($1, $2, $3, $4, $5) returning *`,
            [fullname, email, hashedPassword, title, department]
        );

        logger.info(`User registered successfully: ${email}`);

        res.status(201).json({
            success: true,
            message: "User created successfully!",
            user: {
                id: result.rows[0].id,
                fullname: result.rows[0].fullname,
                email: result.rows[0].email,
                title: result.rows[0].title,
                department: result.rows[0].department
            }
        });
    } catch (error) {
        logger.error(`Registration error for ${req.body.email}: ${error.message}`);
        next(error);
    }
};

export const signIn = async (req, res, next) => {
   try {
        const { email, password } = req.body;
        logger.info(`Login attempt for user: ${email}`);
        
        if (!email || !password) {
            logger.warn(`Login failed - Missing credentials for user: ${email}`);
            throw new ApiError("Email and Password are required.", 400);
        }

        const checkUser = await client.query(`
            SELECT * FROM users 
            WHERE email = $1`,
            [email]
        );

        if (checkUser.rows.length === 0) {
            logger.warn(`Login failed - User not found: ${email}`);
            throw new ApiError("Email or Password is incorrect!", 401);
        }
        
        const user = checkUser.rows[0];
        // console.log("Request password:", password);
        // console.log("DB password hash:", user.password);

        const comparePassword = await bcrypt.compare(password, user.password);

        if (!comparePassword) {
            logger.warn(`Login failed - Invalid password for user: ${email}`);
            throw new ApiError("Email or Password is incorrect!", 401);
        }

        await createToken(user, res);
        logger.info(`User logged in successfully: ${email}`);
    } catch (error) {
        logger.error(`Login error for ${req.body.email}: ${error.message}`);
        next(error);
    }
};

export const forgetPassword = async (req, res, next) => {
    try {
        const {email} = req.body;
        logger.info(`Password reset requested for user: ${email}`);

        if (!email) {
            logger.warn(`Password reset failed - Email not provided`);
            throw new ApiError("Email is required.", 400);
        }

        const checkUser = await client.query(`
            SELECT id, fullname, email FROM users 
            WHERE email = $1`,
            [email]
        );

        if(!checkUser.rows.length > 0) {
            logger.warn(`Password reset failed - User not found: ${email}`);
            throw new ApiError("User does not exist!", 404);
        }
    
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
            Merhaba ${checkUser.rows[0].fullname},\n
            Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:\n
            ${resetCode}\n
            Bu kod 15 dakika boyunca geçerlidir.\n
            Eğer bu işlemi siz başlatmadıysanız bu mesajı yok sayabilirsiniz.`;

        await sendEmail(email, "Şifre Sıfırlama Talebi", mailText);
        logger.info(`Reset code sent successfully to: ${email}`);

        res.status(200).json({
            success: true,
            message: "Reset code sent to your email.",
            reset_code: resetCode
        });
    } catch (error) {
        logger.error(`Password reset error for ${req.body.email}: ${error.message}`);
        next(error);
    }
};

export const checkResetCode = async (req, res, next) => {
    try {
        const { email, reset_code } = req.body;
        logger.info(`Verifying reset code for user: ${email}`);

        if (!email || !reset_code) {
            logger.warn(`Reset code verification failed - Missing required fields for: ${email}`);
            throw new ApiError("Email and reset code are required.", 400);
        }

        const userCheck = await client.query(`
            SELECT id, email, reset_code, reset_time FROM users 
            WHERE email = $1`,
            [email]
        );

        if (userCheck.rows.length === 0) {
            logger.warn(`Reset code verification failed - User not found: ${email}`);
            throw new ApiError("User not found!", 404);
        }

        const user = userCheck.rows[0];

        if (!user.reset_code || !user.reset_time) {
            logger.warn(`Reset code verification failed - No active reset request for: ${email}`);
            throw new ApiError("No active password reset request found.", 400);
        }
        

        const timeDB = moment.utc(user.reset_time);
        const timeNow = moment.utc();
        // console.log("timeDB (UTC):", timeDB.format());
        // console.log("timeNow (UTC):", timeNow.format());

        const differenceInMinutes = timeNow.diff(timeDB, 'minutes');
        // console.log("Difference in minutes:", differenceInMinutes);

        if (differenceInMinutes >= process.env.RESETCODE_EXPIRES_IN) {
            logger.warn(`Reset code verification failed - Code expired for: ${email}`);
            throw new ApiError("Reset code has expired! Please request a new one.", 401);
        }
        

        if (String(user.reset_code) !== String(reset_code)) {
            logger.warn(`Reset code verification failed - Invalid code for: ${email}`);
            throw new ApiError("Invalid reset code!", 400);
        }
        

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

        logger.info(`Reset code verified successfully for: ${email}`);

        res.status(200).json({
            success: true,
            message: "Reset code verified successfully.",
            token: token
        });
    } catch (error) {
        logger.error(`Reset code verification error for ${req.body.email}: ${error.message}`);
        next(error);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        logger.info(`Password change requested for user: ${email}`);

        if (!email || !password) {
            logger.warn(`Password change failed - Missing required fields for: ${email}`);
            throw new ApiError("Email, Password and Token are required.", 400);
        }
        

        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_TEMPORARY_KEY);
        
        if(decoded.type !== "reset") {
            logger.warn(`Password change failed - Invalid token type for: ${email}`);
            throw new ApiError("Invalid token type!", 401);
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        await client.query(`
            UPDATE users SET password = $1, reset_code = NULL, reset_time = NULL 
            WHERE id = $2`,
            [hashedPassword, decoded.sub]
        );

        logger.info(`Password changed successfully for: ${email}`);

        res.status(200).json({
            success: true,
            message: "Password changed successfully!"
        });
    } catch (error) {
        if(error instanceof jwt.JsonWebTokenError) {
            logger.error(`Password change failed - Token error for ${req.body.email}`);
            next(new ApiError("Invalid or expired token", 401));
        } else {
            logger.error(`Password change error for ${req.body.email}: ${error.message}`);
            next(error);
        }
    }
};

export const changePasswordAuthenticated = async (req, res, next) => {
    try {
        const {currentPassword, newPassword} = req.body;
        const userId = req.user.id;
        logger.info(`Authenticated password change requested for user ID: ${userId}`);

        if (!currentPassword || !newPassword) {
            logger.warn(`Authenticated password change failed - Missing passwords for user ID: ${userId}`);
            throw new ApiError("Current password and new password are required.", 400);
        }

        const user = req.user;
        const checkUser = await client.query(`
            SELECT password FROM users 
            WHERE id = $1`,
            [user.id]
        );

        const dbPassword = checkUser.rows[0].password;
        const comparePassword = await bcrypt.compare(currentPassword, dbPassword);
        
        if (!comparePassword) {
            logger.warn(`Authenticated password change failed - Invalid current password for user ID: ${userId}`);
            throw new ApiError("Current password is incorrect!", 401);
        }
        

        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await client.query(`
            UPDATE users SET password = $1 
            WHERE id = $2`,
            [hashedPassword, user.id]
        );

        logger.info(`Password changed successfully for authenticated user ID: ${userId}`);

        res.status(200).json({
            success: true,
            message: "Password changed successfully!"
        });
    } catch (error) {
        logger.error(`Authenticated password change error for user ID ${req.user?.id}: ${error.message}`);
        next(error);
    }
};
