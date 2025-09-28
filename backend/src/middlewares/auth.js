import jwt from "jsonwebtoken";
import client from "../lib/db.js";

export const createToken = async (user, res) => {
  const payload = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    title: user.title,
    department: user.department,
    profile_pic: user.profile_pic,
  };

  const access_token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    algorithm: "HS512",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });

  const refresh_token = await jwt.sign(payload, process.env.JWT_REFRESH_KEY, {
    algorithm: "HS512",
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });

  res.cookie("access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    success: true,
    access_token: access_token,
    refresh_token: refresh_token,
    user: user,
    message: "Authentication successful!",
  });
};

export const verifyToken = async (req, res, next) => {
  try {
    const access_token =
      req.cookies.access_token || req.headers.authorization?.split(" ")[1];

    if (!access_token) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed!",
      });
    }

    const decoded = await jwt.verify(access_token, process.env.JWT_SECRET_KEY);

    const user = await client.query(
      "SELECT id, first_name, last_name, email, title, department, profile_pic FROM users WHERE id = $1",
      [decoded.id]
    );

    if (!user.rows.length > 0) {
      return res.status(401).json({
        success: false,
        message: "User not found!",
      });
    }

    req.user = user.rows[0];
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token has expired!",
      });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token!",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Authentication error!",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refresh_token = req.body.refresh_token;

    if (!refresh_token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required!",
      });
    }

    const decoded = await jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_KEY || "refresh_key"
    );

    const user = await client.query(
      "SELECT id, first_name, last_name, email, title, department FROM users WHERE id = $1",
      [decoded.id]
    );

    if (!user.rows.length > 0) {
      return res.status(401).json({
        success: false,
        message: "User not found!",
      });
    }

    const payload = {
      id: decoded.id,
      first_name: decoded.first_name,
      last_name: decoded.last_name,
      email: decoded.email,
      title: decoded.title,
      department: decoded.department,
    };

    const new_access_token = await jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY,
      {
        algorithm: "HS512",
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      }
    );

    res.cookie("access_token", new_access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully!",
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired!",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token!",
    });
  }
};
