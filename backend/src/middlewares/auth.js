import jwt from 'jsonwebtoken';
import client from "../lib/db.js";

export const createToken = async (user, res) => {
    const payload = {
        sub: user.id,
        name: user.name
    }

    const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        algorithm: 'HS512',
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    return res.status(201).json({
        success: true,
        token: token,
        message: "Authentication successful!"
    });
};

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;

    if(!token)
        return res.status(401).json({
            success: false,
            message: "Authentication failed!"
        });

    await jwt.verify(token, process.env.JWT_SECRET_KEY, async (error, decoded) => {
        if (error)
            return res.status(401).json({
                success: false,
                message: "Verification failed!"
            });

        const user = await client.query(
            "SELECT id, name, surname, email FROM users WHERE id = $1",
            [decoded.sub]
        );

        if(!user.rows.length > 0)
            return res.status(401).json({
                success: false,
                message: "Verification token failed!"
            });

        req.user = user.rows[0];
        next();
    });
};