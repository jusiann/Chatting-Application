import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import {Server} from "socket.io";
import http from "http";
import jwt from 'jsonwebtoken';
import {fileURLToPath} from 'url';

// Routes
import authRoutes from "./src/routes/auth.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import groupRoutes from "./src/routes/group.routes.js";

// Middlewares
import {errorHandler} from "./src/middlewares/error.js";

// Database and utilities
import client from "./src/lib/db.js";
import {createNotification} from "./src/controllers/notification.controller.js";
import {NOTIFICATION_TYPES} from "./src/lib/db.js";

dotenv.config();

// Setup paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS settings
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5001",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Application constants
const port = process.env.PORT || 5001;

// Connected users tracking
const connectedUsers = new Map();
global.connectedUsers = connectedUsers;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5001",
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT || 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Logging middleware
morgan.token('api-prefix', () => '[API]');
app.use(morgan(process.env.NODE_ENV === 'production' 
    ? ':api-prefix [:method] :url :status :res[content-length] - :response-time ms' 
    : ':api-prefix [:method] :url :status :response-time ms'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/health", (req, res) => {
    console.log(`[API] GET /health [200] Health check`);
    res.status(200).json({ 
        status: "UP", 
        timestamp: new Date(),
        environment: process.env.NODE_ENV || "Development",
        version: process.env.npm_package_version
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
    console.log(`[API] GET /health [200] Health check`);
    res.status(200).json({ 
        status: "UP", 
        timestamp: new Date(),
        environment: process.env.NODE_ENV || "Development",
        version: process.env.npm_package_version
    });
});

/**
 * Socket.IO Authentication Middleware
 * Verifies JWT token from socket handshake and attaches user data to socket
 */
io.use((socket, next) => {
    try {
        // Extract token from auth object or authorization header
        const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
        
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        // Verify token and attach user data to socket
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        socket.user = decoded;
        next();
    } catch (error) {
        console.error('[SOCKET] Authentication error:', error.message);
        next(new Error('Authentication error: Invalid token'));
    }
});

/**
 * Socket.IO Connection Handler
 * Manages real-time messaging and notifications
 */
io.on('connection', (socket) => {
    console.log(`[SOCKET] User connected: ${socket.user.id}`);
    connectedUsers.set(socket.user.id, socket);

    /**
     * Handle new message sending
     * Stores message in database and notifies recipient
     */
    socket.on('send_message', async (messageData) => {
        try {
            const {receiver_id, content} = messageData;
            
            if (!receiver_id || !content) {
                throw new Error('Missing required fields: receiver_id or content');
            }
            
            // Get sender information
            const senderResult = await client.query(`
                SELECT first_name, last_name 
                FROM users 
                WHERE id = $1`,
                [socket.user.id]
            );
            
            if (senderResult.rows.length === 0) {
                throw new Error('Sender not found');
            }
            
            const sender = senderResult.rows[0];

            // Save message to database
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
            
            // Get full message details with sender and receiver info
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
            
            // Notify sender that message was sent
            socket.emit('message_sent', fullMessage);

            // Notify receiver if they are online
            const receiverSocket = connectedUsers.get(receiver_id);
            if (receiverSocket) {
                receiverSocket.emit('new_message', fullMessage);
            }
            
            // Create notification for receiver
            await createNotification({
                userId: receiver_id,
                senderId: socket.user.id,
                type: NOTIFICATION_TYPES.NEW_MESSAGE,
                content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                data: {
                    message_id: newMessage.id,
                    sender_name: `${sender.first_name} ${sender.last_name}`
                }
            });

        } catch (error) {
            console.error('[SOCKET] Send message error:', error);
            socket.emit('message_error', { 
                message: 'Failed to send message',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    /**
     * Handle message delivery confirmation
     * Updates message status to 'delivered' and notifies sender
     */
    socket.on('mark_delivered', async (data) => {
        try {
            const {message_id} = data;
            
            if (!message_id) {
                throw new Error('Missing required field: message_id');
            }
            
            const now = new Date();

            // Update message status to 'delivered'
            const result = await client.query(`
                UPDATE messages 
                SET status = 'delivered', delivered_at = $1 
                WHERE id = $2 AND receiver_id = $3 AND status = 'sent'
                RETURNING sender_id`,
                [now, message_id, socket.user.id]
            );

            if (result.rows.length > 0) {
                const senderId = result.rows[0].sender_id;
                
                // Notify sender if they are online
                const senderSocket = connectedUsers.get(senderId);
                if (senderSocket) {
                    senderSocket.emit('message_delivered', {
                        message_id,
                        delivered_at: now
                    });
                }
                
                // Create delivery notification
                await createNotification({
                    userId: senderId,
                    senderId: socket.user.id,
                    type: NOTIFICATION_TYPES.MESSAGE_DELIVERED,
                    content: 'Message delivered',
                    data: {
                        message_id,
                        delivered_at: now
                    }
                });
            }
        } catch (error) {
            console.error('[SOCKET] Mark delivered error:', error);
            socket.emit('delivery_error', { 
                message: 'Failed to mark message as delivered',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    /**
     * Handle message read confirmation
     * Updates message status to 'read' and notifies sender
     */
    socket.on('mark_read', async (data) => {
        try {
            const {message_ids, sender_id} = data;
            
            if (!message_ids || !Array.isArray(message_ids) || !sender_id) {
                throw new Error('Missing or invalid required fields: message_ids or sender_id');
            }
            
            const now = new Date();

            // Update each message status to 'read'
            for (const message_id of message_ids) {
                await client.query(`
                    UPDATE messages 
                    SET status = 'read', read_at = $1 
                    WHERE id = $2 AND receiver_id = $3 AND status != 'read'`,
                    [now, message_id, socket.user.id]
                );
            }

            // Notify sender if they are online
            const senderSocket = connectedUsers.get(sender_id);
            if (senderSocket) {
                senderSocket.emit('messages_read', {
                    message_ids,
                    read_at: now
                });
            }

            // Create read notification
            await createNotification({
                userId: sender_id,
                senderId: socket.user.id,
                type: NOTIFICATION_TYPES.MESSAGE_READ,
                content: 'Messages read',
                data: {
                    message_ids,
                    read_at: now
                }
            });
        } catch (error) {
            console.error('[SOCKET] Mark read error:', error);
            socket.emit('read_error', { 
                message: 'Failed to mark messages as read',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    /**
     * Handle typing indicator
     * Notifies recipient that sender is typing
     */
    socket.on('typing', (data) => {
        try {
            const {receiver_id} = data;
            
            if (!receiver_id) {
                throw new Error('Missing required field: receiver_id');
            }
            
            const receiverSocket = connectedUsers.get(receiver_id);
            if (receiverSocket) {
                receiverSocket.emit('user_typing', {
                    sender_id: socket.user.id
                });
            }
        } catch (error) {
            console.error('[SOCKET] Typing indicator error:', error);
        }
    });

    /**
     * Handle user disconnection
     * Removes user from connected users map
     */
    socket.on('disconnect', () => {
        console.log(`[SOCKET] User disconnected: ${socket.user.id}`);
        connectedUsers.delete(socket.user.id);
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/groups", groupRoutes);

// Error handling middleware (should be after all routes)
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('[API] SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('[API] HTTP server closed');
        client.end().then(() => {
            console.log('[API] Database connection closed');
            process.exit(0);
        }).catch(err => {
            console.error('[API] Error closing database connection:', err);
            process.exit(1);
        });
    });
}); 

process.on('SIGINT', () => {
    console.log('[API] SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('[API] HTTP server closed');
        client.end().then(() => {
            console.log('[API] Database connection closed');
            process.exit(0);
        }).catch(err => {
            console.error('[API] Error closing database connection:', err);
            process.exit(1);
        });
    });
});

// Start server
server.listen(port, () => {
    console.log(`[API] Server running on port ${port}`);
    console.log(`[API] Mode: ${process.env.NODE_ENV || "Development"}`);
    console.log(`[API] Health check available at: http://localhost:${port}/health`);
});
