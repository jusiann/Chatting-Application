import client from "../lib/db.js";
import bcrypt from "bcrypt";
import { createToken } from "../middlewares/auth.js";
import crypto from "crypto";
import moment from "moment";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import { ApiError } from "../middlewares/error.js";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(
      "Invalid email format. Please enter a valid email address.",
      400
    );
  }

  const allowedDomains = ["stu.rumeli.edu.tr"];
  const domain = email.split("@")[1];
  if (!allowedDomains.includes(domain)) {
    throw new ApiError(
      "Only Rumeli University email addresses (@stu.rumeli.edu.tr) are allowed to register.",
      400
    );
  }
};

export const checkUser = (req, res) => {
  const user = req.user;
  const access_token =
    req.cookies.access_token || req.headers.authorization?.split(" ")[1];
  if (!user || !access_token) {
    throw new ApiError("User not authenticated", 401);
  }
  return res.status(200).json({
    success: true,
    user: user,
    access_token: access_token,
    message: "User is authenticated",
  });
};

const validatePassword = (password) => {
  if (password.length < 8) {
    throw new ApiError("Password must be at least 8 characters long.", 400);
  }

  if (!/[A-Z]/.test(password)) {
    throw new ApiError(
      "Password must contain at least one uppercase letter.",
      400
    );
  }

  if (!/[a-z]/.test(password)) {
    throw new ApiError(
      "Password must contain at least one lowercase letter.",
      400
    );
  }

  if (!/[0-9]/.test(password)) {
    throw new ApiError("Password must contain at least one number.", 400);
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw new ApiError(
      'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>).',
      400
    );
  }
};

export const signUp = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, title, department } =
      req.body;

    if (!first_name || !last_name || !email || !password)
      throw new ApiError(
        "First name, Last name, Email and Password are required.",
        400
      );

    if (first_name.length < 2 || last_name.length < 2)
      throw new ApiError(
        "First name and Last name must be at least 2 characters long.",
        400
      );

    if (
      !/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(first_name) ||
      !/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(last_name)
    )
      throw new ApiError(
        "First name and Last name can only contain letters.",
        400
      );

    validateEmail(email);
    validatePassword(password);

    const checkUser = await client.query(
      `
            SELECT * FROM users 
            WHERE email = $1`,
      [email]
    );

    if (checkUser.rows.length > 0)
      throw new ApiError("This email is already registered!", 400);

    const hashedPassword = await bcrypt.hash(password, 8);
    const result = await client.query(
      `
            INSERT INTO users (first_name, last_name, email, password, title, department) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [first_name, last_name, email, hashedPassword, title, department]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully!",
      user: {
        id: result.rows[0].id,
        first_name: result.rows[0].first_name,
        last_name: result.rows[0].last_name,
        email: result.rows[0].email,
        title: result.rows[0].title,
        department: result.rows[0].department,
      },
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

    validateEmail(email);
    const checkUser = await client.query(
      `
            SELECT * FROM users 
            WHERE email = $1`,
      [email]
    );
    if (checkUser.rows.length === 0)
      throw new ApiError("Invalid email or password!", 401);

    const user = checkUser.rows[0];
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) throw new ApiError("Invalid email or password!", 401);

    if (user.failed_login_attempts >= 5 && user.last_failed_login) {
      const lockoutDuration = 15;
      const lastAttempt = new Date(user.last_failed_login);
      const now = new Date();
      const diffInMinutes = (now - lastAttempt) / 1000 / 60;

      if (diffInMinutes < lockoutDuration) {
        throw new ApiError(
          `Too many failed login attempts. Please try again in ${Math.ceil(
            lockoutDuration - diffInMinutes
          )} minutes.`,
          429
        );
      }
    }

    await client.query(
      `
            UPDATE users 
            SET failed_login_attempts = 0, 
                last_failed_login = NULL 
            WHERE id = $1`,
      [user.id]
    );

    await createToken(user, res);
  } catch (error) {
    if (error.statusCode === 401) {
      const user = await client.query(
        `
                SELECT id, failed_login_attempts FROM users WHERE email = $1`,
        [req.body.email]
      );

      if (user.rows.length > 0) {
        const remainingAttempts = 5 - (user.rows[0].failed_login_attempts + 1);
        await client.query(
          `
                    UPDATE users 
                    SET failed_login_attempts = failed_login_attempts + 1,
                        last_failed_login = NOW()
                    WHERE id = $1`,
          [user.rows[0].id]
        );

        if (remainingAttempts > 0) {
          error.message += ` ${remainingAttempts} attempts remaining.`;
        }
      }
    }
    next(error);
  }
};

export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError("Email is required.", 400);

    const checkUser = await client.query(
      `
            SELECT id, first_name, last_name, email FROM users 
            WHERE email = $1`,
      [email]
    );

    if (!checkUser.rows.length > 0)
      throw new ApiError("User does not exist!", 404);

    const resetCode = crypto.randomBytes(16).toString("hex");
    const resetTime = new Date().toISOString();
    await client.query(
      `
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

    res.status(200).json({
      success: true,
      message: "Reset code sent to your email.",
      reset_code: resetCode,
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

    const userCheck = await client.query(
      `
            SELECT id, email, reset_code, reset_time FROM users 
            WHERE email = $1`,
      [email]
    );

    if (userCheck.rows.length === 0) throw new ApiError("User not found!", 404);

    const user = userCheck.rows[0];
    if (!user.reset_code || !user.reset_time)
      throw new ApiError("No active password reset request found.", 400);

    const timeDB = moment.utc(user.reset_time);
    const timeNow = moment.utc();
    const differenceInMinutes = timeNow.diff(timeDB, "minutes");
    if (differenceInMinutes >= parseInt(process.env.RESETCODE_EXPIRES_IN))
      throw new ApiError(
        "Reset code has expired! Please request a new one.",
        401
      );

    if (String(user.reset_code) !== String(reset_code))
      throw new ApiError("Invalid reset code!", 400);

    await client.query(
      `
            UPDATE users SET reset_code = NULL, reset_time = NULL 
            WHERE id = $1`,
      [user.id]
    );

    const payload = {
      sub: user.id,
      email: user.email,
      type: "reset",
    };

    const temporary_token = jwt.sign(payload, process.env.JWT_TEMPORARY_KEY, {
      expiresIn: process.env.JWT_TEMPORARY_EXPIRES_IN || "5m",
    });

    res.cookie("temporary_token", temporary_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Reset code verified successfully.",
      temporary_token: temporary_token,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      throw new ApiError(
        "Email, Password and Temporary Token are required.",
        400
      );

    const temporary_token = req.cookies.temporary_token;
    if (!temporary_token)
      throw new ApiError("Temporary token is missing!", 401);

    const decoded = jwt.verify(temporary_token, process.env.JWT_TEMPORARY_KEY);
    if (decoded.type !== "reset")
      throw new ApiError("Invalid temporary token type!", 401);

    const userCheck = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userCheck.rows.length === 0) throw new ApiError("User not found!", 404);

    const userId = userCheck.rows[0].id;
    if (userId !== decoded.sub)
      throw new ApiError("Token does not match with the user!", 401);

    const hashedPassword = await bcrypt.hash(password, 8);
    const updateResult = await client.query(
      `
            UPDATE users 
            SET password = $1, 
                reset_code = NULL, 
                reset_time = NULL 
            WHERE id = $2 AND email = $3
            RETURNING id`,
      [hashedPassword, userId, email]
    );

    if (updateResult.rows.length === 0)
      throw new ApiError("Failed to update password.", 500);

    res.clearCookie("temporary_token");

    res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError("Invalid or expired token", 401));
    } else {
      next(error);
    }
  }
};

export const changePasswordAuthenticated = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    if (!currentPassword || !newPassword)
      throw new ApiError(
        "Current password and new password are required.",
        400
      );

    const user = req.user;
    const checkUser = await client.query(
      `
            SELECT password FROM users 
            WHERE id = $1`,
      [user.id]
    );

    const dbPassword = checkUser.rows[0].password;
    const comparePassword = await bcrypt.compare(currentPassword, dbPassword);
    if (!comparePassword)
      throw new ApiError("Current password is incorrect!", 401);

    const hashedPassword = await bcrypt.hash(newPassword, 8);
    await client.query(
      `
            UPDATE users SET password = $1 
            WHERE id = $2`,
      [hashedPassword, user.id]
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const refresh_token = authHeader?.split(" ")[1];
    if (!refresh_token) throw new ApiError("Refresh token is required.", 401);

    const decoded = await jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_KEY
    );
    const user = await client.query(
      `
            SELECT id, first_name, last_name, email, title, department, profile_pic FROM users 
            WHERE id = $1`,
      [decoded.id]
    );

    if (!user.rows[0]) throw new ApiError("User not found.", 404);

    const payload = {
      id: user.rows[0].id,
      first_name: user.rows[0].first_name,
      last_name: user.rows[0].last_name,
      email: user.rows[0].email,
      title: user.rows[0].title,
      department: user.rows[0].department,
    };

    const access_token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      algorithm: "HS512",
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });

    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      access_token: access_token,
      message: "Token refreshed successfully!",
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)
      next(new ApiError("Refresh token has expired.", 401));
    else if (error instanceof jwt.JsonWebTokenError)
      next(new ApiError("Invalid refresh token.", 403));
    else next(error);
  }
};

export const changeName = async (req, res, next) => {
  try {
    const { first_name, last_name } = req.body;
    if (!first_name || !last_name)
      throw new ApiError("First name and last name are required.", 400);

    const updatedUser = await client.query(
      `
            UPDATE users SET first_name = $1, last_name = $2 
            WHERE id = $3 RETURNING *`,
      [first_name, last_name, req.user.id]
    );

    if (updatedUser.rows.length === 0)
      throw new ApiError("Failed to update user name.", 400);

    const user = updatedUser.rows[0];
    await createToken(user, res);

    res.status(200).json({
      success: true,
      message: "Name changed successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const changeTitle = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;
    if (!title) throw new ApiError("Title is required.", 400);

    const updatedUser = await client.query(
      `
            UPDATE users SET title = $1 
            WHERE id = $2 RETURNING *`,
      [title, userId]
    );

    if (updatedUser.rows.length === 0)
      throw new ApiError("Failed to update user title.", 400);

    const user = updatedUser.rows[0];
    await createToken(user, res);

    res.status(200).json({
      success: true,
      message: "Title changed successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "Dosya bulunamadı." });

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return res
        .status(400)
        .json({ message: "Sadece JPEG/PNG/WEBP kabul edilir." });
    }
    if (file.size > MAX_FILE_SIZE) {
      return res.status(413).json({ message: "Dosya boyutu 2MB'ı aşamaz." });
    }

    const keySafeName = file.originalname?.replace(/\s+/g, "_") || "file";
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `profile-pics/${userId}-${Date.now()}-${keySafeName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Upload to S3 and wait for completion
    const uploadResult = await s3.upload(params).promise();
    const imageUrl = uploadResult.Location;

    if (!imageUrl) {
      return res
        .status(500)
        .json({ message: "S3 yükleme sonucu URL alınamadı." });
    }

    const updatedUser = await client.query(
      `UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING *`,
      [imageUrl, userId]
    );

    if (updatedUser.rows[0]) {
      await createToken(updatedUser.rows[0], res);
      return; // createToken already sent the response
    }

    return res.status(404).json({ message: "Kullanıcı bulunamadı." });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Profil resmi yüklenemedi.",
      error: err?.message || err,
    });
  }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.body.userId || req.params.id;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    };

    await client.query(
      'DELETE FROM user_tokens WHERE user_id = $1',
      [userId]
    );

    // Clear auth-related cookies
    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("temporary_token", cookieOptions);


    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const fcmToken = async (req, res, next) => {
  try {
     const { userId, fcmToken } = req.body;
  if (!userId || !fcmToken) return res.status(400).json({ error: 'Missing fields' });

  await client.query(
    'INSERT INTO user_tokens (user_id, fcm_token) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET fcm_token = EXCLUDED.fcm_token',
    [userId, fcmToken]
  );

  res.json({ message: 'Token saved' });
  } catch (error) {
    next(error);
  }
};
