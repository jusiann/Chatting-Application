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

// Rotalar
import authRoutes from "./src/routes/auth.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import groupRoutes from "./src/routes/group.routes.js";

// Middleware'ler
import {errorHandler} from "./src/middlewares/error.js";

// Veritabanı ve yardımcı modüller
import client from "./src/lib/db.js";
import {createNotification} from "./src/controllers/notification.controller.js";
import {NOTIFICATION_TYPES} from "./src/lib/db.js";

dotenv.config();

// ES modülleri için dosya yolları
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express ve HTTP sunucusu
const app = express();
const server = http.createServer(app);

// Socket.IO yapılandırması
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5001",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Port ve bağlı kullanıcılar
const port = process.env.PORT || 5001;
global.connectedUsers = new Map();

// Güvenlik ve diğer middleware'ler
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5001",
    credentials: true
}));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
}));
morgan.token('api-prefix', () => '[API]');
app.use(morgan(process.env.NODE_ENV === 'production' 
    ? ':api-prefix [:method] :url :status :res[content-length] - :response-time ms' 
    : ':api-prefix [:method] :url :status :response-time ms'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sistem durumu kontrolü
app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "UP", 
        timestamp: new Date(),
        environment: process.env.NODE_ENV || "Development",
        version: process.env.npm_package_version
    });
});

// Socket.IO kimlik doğrulama middleware'i
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
        if (!token) return next(new Error('Authentication error: No token provided'));
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        socket.user = decoded;
        next();
    } catch (error) {
        console.error('[SOCKET] Authentication error:', error.message);
        next(new Error('Authentication error: Invalid token'));
    }
});

// Socket.IO bağlantı yönetimi
io.on('connection', (socket) => {
    console.log(`[SOCKET] User connected: ${socket.user.id}`);
    global.connectedUsers.set(socket.user.id, socket);

    // Grup katılma işlemi
    socket.on('join_group', (groupId) => {
        socket.join(`group_${groupId}`);
        console.log(`[SOCKET] User ${socket.user.id} joined group ${groupId}`);
    });

    socket.on('send_message', async (messageData) => {
        try {
            const {receiver_id, content} = messageData;
            if (!receiver_id || !content) throw new Error('Eksik alanlar: receiver_id veya content');
            
            const senderResult = await client.query('SELECT first_name, last_name FROM users WHERE id = $1', [socket.user.id]);
            if (senderResult.rows.length === 0) throw new Error('Gönderen bulunamadı');
            const sender = senderResult.rows[0];

            const result = await client.query(
                'INSERT INTO messages (sender_id, receiver_id, content, status, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
                [socket.user.id, receiver_id, content, 'sent']
            );
            const newMessage = result.rows[0];
            
            const messageWithDetails = await client.query(`
                SELECT m.*, 
                       json_build_object('id', s.id, 'first_name', s.first_name, 'last_name', s.last_name, 'profile_pic', s.profile_pic) as sender,
                       json_build_object('id', r.id, 'first_name', r.first_name, 'last_name', r.last_name, 'profile_pic', r.profile_pic) as receiver
                FROM messages m
                JOIN users s ON m.sender_id = s.id
                JOIN users r ON m.receiver_id = r.id
                WHERE m.id = $1`, 
                [newMessage.id]
            );
            const fullMessage = messageWithDetails.rows[0];
            
            socket.emit('message_sent', fullMessage);

            const receiverSocket = global.connectedUsers.get(receiver_id);
            if (receiverSocket) receiverSocket.emit('new_message', fullMessage);
            
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

    socket.on('mark_delivered', async (data) => {
        try {
            const {message_id} = data;
            if (!message_id) throw new Error('Eksik alan: message_id');
            
            const now = new Date();
            const result = await client.query(
                `UPDATE messages SET status = 'delivered', delivered_at = $1 WHERE id = $2 AND receiver_id = $3 AND status = 'sent' RETURNING sender_id`,
                [now, message_id, socket.user.id]
            );

            if (result.rows.length > 0) {
                const senderId = result.rows[0].sender_id;
                const senderSocket = global.connectedUsers.get(senderId);
                if (senderSocket) {
                    senderSocket.emit('message_delivered', {
                        message_id,
                        delivered_at: now
                    });
                }
                
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

    socket.on('mark_read', async (data) => {
        try {
            const {message_ids, sender_id} = data;
            if (!message_ids || !Array.isArray(message_ids) || !sender_id) throw new Error('Eksik veya geçersiz alanlar: message_ids veya sender_id');
            
            const now = new Date();
            for (const message_id of message_ids) {
                await client.query(
                    `UPDATE messages SET status = 'read', read_at = $1 WHERE id = $2 AND receiver_id = $3 AND status != 'read'`,
                    [now, message_id, socket.user.id]
                );
            }

            const senderSocket = global.connectedUsers.get(sender_id);
            if (senderSocket) senderSocket.emit('messages_read', { message_ids, read_at: now });

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

    socket.on('typing', (data) => {
        try {
            const {receiver_id} = data;
            if (!receiver_id) {
                throw new Error('Missing required field: receiver_id');
            }
            
            const receiverSocket = global.connectedUsers.get(receiver_id);
            if (receiverSocket) {
                receiverSocket.emit('user_typing', {
                    sender_id: socket.user.id
                });
            }
        } catch (error) {
            console.error('[SOCKET] Typing indicator error:', error);
        }
    });

    // Grup mesajı gönderme
    socket.on('group_message', async (msg) => {
        try {
            const result = await client.query(` 
                INSERT INTO group_messages (group_id, sender_id, content, status) 
                VALUES ($1, $2, $3, 'sent') RETURNING * 
            `, [msg.groupId, socket.user.id, msg.content]);
            
            const savedMesssage = result.rows[0];
            io.to(`group_${msg.groupId}`).emit('group_message', savedMesssage);
        } catch (error) {
            console.error('[SOCKET] Group message error:', error);
            socket.emit('group_message_error', { 
                message: 'Failed to send group message',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // Bağlantı kesilmesi
    socket.on('disconnect', () => {
        console.log(`[SOCKET] User disconnected: ${socket.user.id}`);
        global.connectedUsers.delete(socket.user.id);
    });
});

// API Rotaları
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/groups", groupRoutes);

// Hata yakalama middleware'i
app.use(errorHandler);

// Sunucuyu düzgün kapatma
const gracefulShutdown = (signal) => {
    process.on(signal, () => {
        console.log(`[API] ${signal} signal received: closing HTTP server`);
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
};

gracefulShutdown('SIGINT');
gracefulShutdown('SIGTERM');

// Sunucuyu başlatma
server.listen(port, () => {
    console.log(`[API] Server running on port ${port}`);
    console.log(`[API] Mode: ${process.env.NODE_ENV || "Development"}`);
    console.log(`[API] Health check available at: http://localhost:${port}/health`);
});
