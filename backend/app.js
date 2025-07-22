import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { Server } from "socket.io";
import http from "http";
import jwt from 'jsonwebtoken';
import authRoutes from "./src/routes/auth.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import {errorHandler} from "./src/middlewares/error.js";
import {fileURLToPath} from 'url';
import client from "./src/lib/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5001",
        methods: ["GET", "POST"],
        credentials: true
    }
});

const port = process.env.PORT || 5001;
const connectedUsers = new Map();

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5001",
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.RATE_LIMIT || 100
});

app.use(limiter);

morgan.token('api-prefix', () => '[API]');
app.use(morgan(process.env.NODE_ENV === 'production' 
    ? ':api-prefix [:method] :url :status :res[content-length] - :response-time ms' 
    : ':api-prefix [:method] :url :status :response-time ms'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        socket.user = decoded;
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log(`[SOCKET] User connected: ${socket.user.id}`);
    connectedUsers.set(socket.user.id, socket);
    socket.on('send_message', async (messageData) => {
        try {
            const { receiver_id, content } = messageData;
            
            const result = await client.query(`
                INSERT INTO messages (
                    sender_id, 
                    receiver_id, 
                    content, 
                    status, 
                    created_at
                ) VALUES ($1, $2, $3, $4, NOW()) 
                RETURNING *`,
                [socket.user.id, receiver_id, content, 'sent']
            );

            const newMessage = result.rows[0];

            const messageWithDetails = await client.query(`
                SELECT 
                    m.*,
                    json_build_object(
                        'id', s.id,
                        'first_name', s.first_name,
                        'last_name', s.last_name,
                        'profile_pic', s.profile_pic
                    ) as sender,
                    json_build_object(
                        'id', r.id,
                        'first_name', r.first_name,
                        'last_name', r.last_name,
                        'profile_pic', r.profile_pic
                    ) as receiver
                FROM messages m
                JOIN users s ON m.sender_id = s.id
                JOIN users r ON m.receiver_id = r.id
                WHERE m.id = $1`,
                [newMessage.id]
            );

            const fullMessage = messageWithDetails.rows[0];
            socket.emit('message_sent', fullMessage);
            const receiverSocket = connectedUsers.get(receiver_id);
            if (receiverSocket)
                receiverSocket.emit('new_message', fullMessage);
        } catch (error) {
            console.error('[SOCKET] Send message error:', error);
            socket.emit('message_error', { message: 'Failed to send message' });
        }
    });

    socket.on('mark_delivered', async (data) => {
        try {
            const { message_id } = data;
            const now = new Date();

            await client.query(`
                UPDATE messages 
                SET status = 'delivered', delivered_at = $1 
                WHERE id = $2 AND receiver_id = $3 AND status = 'sent'
                RETURNING sender_id`,
                [now, message_id, socket.user.id]
            );

            const senderSocket = connectedUsers.get(data.sender_id);
            if (senderSocket) {
                senderSocket.emit('message_delivered', {
                    message_id,
                    delivered_at: now
                });
            }
        } catch (error) {
            console.error('[SOCKET] Mark delivered error:', error);
        }
    });


    socket.on('mark_read', async (data) => {
        try {
            const { message_ids, sender_id } = data;
            const now = new Date();

            for (const message_id of message_ids) {
                await client.query(`
                    UPDATE messages 
                    SET status = 'read', read_at = $1 
                    WHERE id = $2 AND receiver_id = $3 AND status != 'read'`,
                    [now, message_id, socket.user.id]
                );
            }

            // Notify sender if online
            const senderSocket = connectedUsers.get(sender_id);
            if (senderSocket) {
                senderSocket.emit('messages_read', {
                    message_ids,
                    read_at: now
                });
            }
        } catch (error) {
            console.error('[SOCKET] Mark read error:', error);
        }
    });

    socket.on('typing', (data) => {
        const receiverSocket = connectedUsers.get(data.receiver_id);
        if (receiverSocket) {
            receiverSocket.emit('user_typing', {
                sender_id: socket.user.id
            });
        }
    });

    socket.on('disconnect', () => {
        console.log(`[SOCKET] User disconnected: ${socket.user.id}`);
        connectedUsers.delete(socket.user.id);
    });
});

app.get("/health", (req, res) => {
    console.log(`[API] GET /health [200] Health check`);
    res.status(200).json({ 
        status: "UP", 
        timestamp: new Date(),
        environment: process.env.NODE_ENV || "Development",
        version: process.env.npm_package_version
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.use(errorHandler);

process.on('SIGTERM', () => {
    console.log('[API] SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('[API] HTTP server closed');
        process.exit(0);
    });
});

server.listen(port, () => {
    console.log(`[API] Server running on port ${port}`);
    console.log(`[API] Mode: ${process.env.NODE_ENV || "Development"}`);
});
