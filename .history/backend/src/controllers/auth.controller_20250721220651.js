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
        const {first_name, last_name, email, password, title, department} = req.body;
        console.log(`Attempting to register new user: ${email}`);

        if (!first_name || !last_name || !email || !password) {
            console.log(`Registration failed - Missing required fields for user: ${email}`);
            throw new ApiError("First name, Last name, Email and Password are required.", 400);
        }

        const checkUser = await client.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if(checkUser.rows.length > 0) {
            console.log(`Registration failed - Email already exists: ${email}`);
            throw new ApiError("Email already exists!", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const result = await client.query(`
            INSERT INTO users (first_name, last_name, email, password, title, department) 
            VALUES ($1, $2, $3, $4, $5, $6) returning *`,
            [first_name, last_name, email, hashedPassword, title, department]
        );

        console.log(`User registered successfully: ${email}`);

        res.status(201).json({
            success: true,
            message: "User created successfully!",
            user: {
                id: result.rows[0].id,
                first_name: result.rows[0].first_name,
                last_name: result.rows[0].last_name,
                email: result.rows[0].email,
                title: result.rows[0].title,
                department: result.rows[0].department
            }
        });
    } catch (error) {
        console.error(`Registration error for ${req.body.email}: ${error.message}`);
        next(error);
    }
};

export const signIn = async (req, res, next) => {
   try {
        const { email, password } = req.body;
        console.log(`Login attempt for user: ${email}`);
        
        if (!email || !password) {
            console.log(`Login failed - Missing credentials for user: ${email}`);
            throw new ApiError("Email and Password are required.", 400);
        }

        const checkUser = await client.query(`
            SELECT * FROM users 
            WHERE email = $1`,
            [email]
        );

        if (checkUser.rows.length === 0) {
            console.log(`Login failed - User not found: ${email}`);
            throw new ApiError("Email or Password is incorrect!", 401);
        }
        
        const user = checkUser.rows[0];

        const comparePassword = await bcrypt.compare(password, user.password);

        if (!comparePassword) {
            console.log(`Login failed - Invalid password for user: ${email}`);
            throw new ApiError("Email or Password is incorrect!", 401);
        }

        await createToken(user, res);
        console.log(`User logged in successfully: ${email}`);
    } catch (error) {
        console.error(`Login error for ${req.body.email}: ${error.message}`);
        next(error);
    }
};

export const forgetPassword = async (req, res, next) => {
    try {
        const {email} = req.body;
        console.log(`Password reset requested for user: ${email}`);

        if (!email) {
            console.log(`Password reset failed - Email not provided`);
            throw new ApiError("Email is required.", 400);
        }

        const checkUser = await client.query(`
            SELECT id, first_name, last_name, email FROM users 
            WHERE email = $1`,
            [email]
        );

        if(!checkUser.rows.length > 0) {
            console.log(`Password reset failed - User not found: ${email}`);
            throw new ApiError("User does not exist!", 404);
        }
    
        const resetCode = crypto.randomBytes(16).toString("hex");
        const resetTime = new Date().toISOString();

        await client.query(`
            UPDATE users SET reset_code = $1, reset_time = $2 
            WHERE email = $3`,
            [resetCode, resetTime, email]
        );

        const mailText = `
            Merhaba ${checkUser.rows[0].first_name} ${checkUser.rows[0].last_name},\n
            Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:\n
            ${resetCode}\n
            Bu kod 15 dakika boyunca geçerlidir.\n
            Eğer bu işlemi siz başlatmadıysanız bu mesajı yok sayabilirsiniz.`;

        await sendEmail(email, "Şifre Sıfırlama Talebi", mailText);
        console.log(`Reset code sent successfully to: ${email}`);

        res.status(200).json({
            success: true,
            message: "Reset code sent to your email.",
            reset_code: resetCode
        });
    } catch (error) {
        console.error(`Password reset error for ${req.body.email}: ${error.message}`);
        next(error);
    }
};

export const checkResetCode = async (req, res, next) => {
    try {
        const { email, reset_code } = req.body;
        console.log(`Verifying reset code for user: ${email}`);

        if (!email || !reset_code) {
            console.log(`Reset code verification failed - Missing required fields for: ${email}`);
            throw new ApiError("Email and reset code are required.", 400);
        }

        const userCheck = await client.query(`
            SELECT id, email, reset_code, reset_time FROM users 
            WHERE email = $1`,
            [email]
        );

        if (userCheck.rows.length === 0) {
            console.log(`Reset code verification failed - User not found: ${email}`);
            throw new ApiError("User not found!", 404);
        }

        const user = userCheck.rows[0];

        if (!user.reset_code || !user.reset_time) {
            console.log(`Reset code verification failed - No active reset request for: ${email}`);
            throw new ApiError("No active password reset request found.", 400);
        }

        const timeDB = moment.utc(user.reset_time);
        const timeNow = moment.utc();

        const differenceInMinutes = timeNow.diff(timeDB, 'minutes');

        if (differenceInMinutes >= process.env.RESETCODE_EXPIRES_IN) {
            console.log(`Reset code verification failed - Code expired for: ${email}`);
            throw new ApiError("Reset code has expired! Please request a new one.", 401);
        }

        if (String(user.reset_code) !== String(reset_code)) {
            console.log(`Reset code verification failed - Invalid code for: ${email}`);
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

        const temporary_token = jwt.sign(payload, process.env.JWT_TEMPORARY_KEY, {
            expiresIn: process.env.JWT_TEMPORARY_EXPIRES_IN || '5m'
        });

        console.log(`Reset code verified successfully for: ${email}`);

        res.cookie('temporary_token', temporary_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60 * 1000 // 5 minutes
        });

        res.status(200).json({
            success: true,
            message: "Reset code verified successfully.",
            temporary_token: temporary_token
        });
    } catch (error) {
        console.error(`Reset code verification error for ${req.body.email}: ${error.message}`);
        next(error);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        console.log(`Password change requested for user: ${email}`);

        if (!email || !password) {
            console.log(`Password change failed - Missing required fields for: ${email}`);
            throw new ApiError("Email, Password and Temporary Token are required.", 400);
        }
        
        const temporary_token = req.cookies.temporary_token;
        const decoded = jwt.verify(temporary_token, process.env.JWT_TEMPORARY_KEY);
        
        if(decoded.type !== "reset") {
            console.log(`Password change failed - Invalid token type for: ${email}`);
            throw new ApiError("Invalid temporary token type!", 401);
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        await client.query(`
            UPDATE users SET password = $1, reset_code = NULL, reset_time = NULL 
            WHERE id = $2`,
            [hashedPassword, decoded.id]
        );

        console.log(`Password changed successfully for: ${email}`);

        res.status(200).json({
            success: true,
            message: "Password changed successfully!"
        });
    } catch (error) {
        if(error instanceof jwt.JsonWebTokenError) {
            console.error(`Password change failed - Token error for ${req.body.email}`);
            next(new ApiError("Invalid or expired token", 401));
        } else {
            console.error(`Password change error for ${req.body.email}: ${error.message}`);
            next(error);
        }
    }
};

export const changePasswordAuthenticated = async (req, res, next) => {
    try {
        const {currentPassword, newPassword} = req.body;
        const userId = req.user.id;
        console.log(`Authenticated password change requested for user ID: ${userId}`);

        if (!currentPassword || !newPassword) {
            console.log(`Authenticated password change failed - Missing passwords for user ID: ${userId}`);
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
            console.log(`Authenticated password change failed - Invalid current password for user ID: ${userId}`);
            throw new ApiError("Current password is incorrect!", 401);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await client.query(`
            UPDATE users SET password = $1 
            WHERE id = $2`,
            [hashedPassword, user.id]
        );

        console.log(`Password changed successfully for authenticated user ID: ${userId}`);

        res.status(200).json({
            success: true,
            message: "Password changed successfully!"
        });
    } catch (error) {
        console.error(`Authenticated password change error for user ID ${req.user?.id}: ${error.message}`);
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const refresh_token = authHeader?.split(' ')[1];

        if (!refresh_token) {
            throw new ApiError("Refresh token is required.", 401);
        }

        const decoded = await jwt.verify(refresh_token, process.env.JWT_REFRESH_KEY || 'refresh_key');
        
        const user = await client.query(
            "SELECT id, first_name, last_name, email, title, department, profile_pic FROM users WHERE id = $1",
            [decoded.id]
        );

        if (!user.rows[0]) {
            throw new ApiError("User not found.", 404);
        }

        await createToken(user.rows[0], res);

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            next(new ApiError("Refresh token has expired.", 401));
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new ApiError("Invalid refresh token.", 403));
        } else {
            next(error);
        }
    }
};

export const changeName = async (req, res, next) => {
    try {
        const {first_name, last_name} = req.body;
        if (!first_name || !last_name)
            throw new ApiError("First name and last name are required.", 400);

        const updatedUser = await client.query(`
            UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3 RETURNING *`,
            [first_name, last_name, req.user.id]
        );

        if (updatedUser.rows.length === 0)
            throw new ApiError("Failed to update user name.", 400);

        const user = updatedUser.rows[0];

        await createToken(user, res);

        res.status(200).json({
            success: true,
            message: "Name changed successfully!"
        })
    } catch (error) {
        next(error);
    }
};

export const changeTitle = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {title} = req.body;
        if (!title)
            throw new ApiError("Title is required.", 400);

        const updatedUser = await client.query(`
            UPDATE users SET title = $1 WHERE id = $2 RETURNING *`,
            [title, userId]
        );

        if (updatedUser.rows.length === 0)
            throw new ApiError("Failed to update user title.", 400);

        const user = updatedUser.rows[0];

        await createToken(user, res);

        res.status(200).json({
            success: true,
            message: "Title changed successfully!"
        });
    } catch (error) {
        next(error);
    }
};

export const changeProfilePicture = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        if (!req.file) {
            throw new ApiError("Profile picture is required.", 400);
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            throw new ApiError("Only JPG, JPEG and PNG files are allowed.", 400);
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
            throw new ApiError("File size cannot exceed 5MB.", 400);
        }

        const profilePicPath = req.file.path;

        const updatedUser = await client.query(`
            UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING *`,
            [profilePicPath, userId]
        );

        if (updatedUser.rows.length === 0)
            throw new ApiError("Failed to update user profile picture.", 400);

        const user = updatedUser.rows[0];

        await createToken(user, res);

        res.status(200).json({
            success: true,
            message: "Profile picture changed successfully!",
            profile_pic: profilePicPath
        });

    } catch (error) {
        next(error);
    }
};
