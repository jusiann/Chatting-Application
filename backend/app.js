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
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import AWS from "aws-sdk";
import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync(
    new URL(
      "./rumeli-chat-app-firebase-adminsdk-fbsvc-5dd8147f7f.json",
      import.meta.url
    )
  )
);

// Rotalar
import authRoutes from "./src/routes/auth.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import groupRoutes from "./src/routes/group.routes.js";

// Middleware'ler
import { errorHandler } from "./src/middlewares/error.js";

// Veritabanı ve yardımcı modüller
import client from "./src/lib/db.js";
import { createNotification } from "./src/controllers/notification.controller.js";
import { NOTIFICATION_TYPES } from "./src/lib/db.js";

dotenv.config();

// ES modülleri için dosya yolları
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express ve HTTP sunucusu
const app = express();
const server = http.createServer(app);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

// Socket.IO yapılandırması
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5001",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Port ve bağlı kullanıcılar
const port = process.env.PORT || 5001;
global.connectedUsers = new Map();

// Güvenlik ve diğer middleware'ler
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5001",
    credentials: true,
  })
);
/* app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
})); */
morgan.token("api-prefix", () => "[API]");
app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? ":api-prefix [:method] :url :status :res[content-length] - :response-time ms"
      : ":api-prefix [:method] :url :status :response-time ms"
  )
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Sistem durumu kontrolü
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "Development",
    version: process.env.npm_package_version,
  });
});

// Socket.IO kimlik doğrulama middleware'i
io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth.access_token ||
      socket.handshake.headers["authorization"]?.split(" ")[1];
    if (!token)
      return next(new Error("Authentication error: No token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    socket.user = decoded;
    next();
  } catch (error) {
    console.error("[SOCKET] Authentication error:", error.message);
    next(new Error("Authentication error: Invalid token"));
  }
});

// Socket.IO bağlantı yönetimi
io.on("connection", async (socket) => {
  console.log(`[SOCKET] User connected: ${socket.user.id}`);
  global.connectedUsers.set(socket.user.id, socket);
  socket.join(`user_${socket.user.id}`);

  function getSocketByUserId(userId) {
    return global.connectedUsers.get(userId);
  }

  io.emit("message_delivered", {
    receiver_id: socket.user.id,
  });

  io.emit("online", { id: socket.user.id });
  await client.query(`UPDATE users SET is_online = TRUE WHERE id = $1`, [
    socket.user.id,
  ]);

  const userGroups = await client.query(
    `SELECT group_id FROM group_members WHERE user_id = $1`,
    [socket.user.id]
  );

  // Grup katılma işlemi
  userGroups.rows.forEach((row) => {
    socket.join(`group_${row.group_id}`);
    console.log(`[SOCKET] User ${socket.user.id} joined group ${row.group_id}`);
  });

  socket.on("join_group", async (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`[SOCKET] User ${socket.user.id} joined group ${groupId}`);
  });

  socket.on("new_group", (data) => {
    const { memberIds, groupId } = data;
    memberIds.forEach((memberId) => {
      socket.to(`user_${memberId}`).emit("new_group", groupId);
    });
  });

  socket.on("join_chat", (data) => {
    const { userId, chatWith } = data;
    socket.activeChatWith = chatWith; // socket üzerinde geçici state
  });

  socket.on("leave_chat", ({ userId }) => {
    socket.activeChatWith = null;
  });

  socket.on("send_message", async (messageData) => {
    try {
      const { receiver_id, content } = messageData;
      if (!receiver_id || !content)
        throw new Error("Eksik alanlar: receiver_id veya content");

      const senderResult = await client.query(
        "SELECT first_name, last_name, title FROM users WHERE id = $1",
        [socket.user.id]
      );
      if (senderResult.rows.length === 0)
        throw new Error("Gönderen bulunamadı");
      const sender = senderResult.rows[0];

      const result = await client.query(
        "INSERT INTO messages (sender_id, receiver_id, content, status, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
        [socket.user.id, receiver_id, content, "sent"]
      );
      let newMessage = result.rows[0];
      const lastMessage = {
        sender: newMessage.sender_id,
        status: newMessage.status,
      };
      newMessage = { ...newMessage, lastMessage: lastMessage };

      socket.emit("message_sent", newMessage);

      io.to(`user_${receiver_id}`).emit("new_message", newMessage);

      const receiverSocket = getSocketByUserId(receiver_id);
      if (!receiverSocket || receiverSocket.activeChatWith !== socket.user.id) {
        const tokenResult = await client.query(
          "SELECT fcm_token FROM user_tokens WHERE user_id=$1",
          [receiver_id]
        );
        const userFcmToken = tokenResult.rows[0]?.fcm_token;
        if (userFcmToken) {
          await admin.messaging().send({
            token: userFcmToken,
            notification: {
              title: `${sender.title} ${sender.first_name} ${sender.last_name}`,
              body: newMessage.content,
            },
            data: {
              senderId: socket.user.id.toString(),
              messageId: newMessage.id.toString(),
            },
          });
        }
      }
    } catch (error) {
      console.error("[SOCKET] Send message error:", error);
      socket.emit("message_error", {
        message: "Failed to send message",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });

  socket.on("mark_delivered", async (data) => {
    try {
      const { receiver_id, sender_id } = data;
      if (!receiver_id || !sender_id)
        throw new Error("Eksik alan: receiver_id veya sender_id");

      const now = new Date();
      const result = await client.query(
        `UPDATE messages SET status = 'delivered', delivered_at = $1 where receiver_id = $2 AND sender_id = $3 AND status = 'sent' RETURNING sender_id`,
        [now, receiver_id, sender_id]
      );

      if (result.rows.length > 0) {
        const senderId = result.rows[0].sender_id;

        io.to(`user_${senderId}`).emit("message_delivered", {
          receiver_id: receiver_id,
        });

        /* await createNotification({
          userId: senderId,
          senderId: socket.user.id,
          type: NOTIFICATION_TYPES.MESSAGE_DELIVERED,
          content: "Message delivered",
          data: {
            message_id,
            delivered_at: now,
          },
        }); */
      }
    } catch (error) {
      console.error("[SOCKET] Mark delivered error:", error);
      socket.emit("delivery_error", {
        message: "Failed to mark message as delivered",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });

  socket.on("mark_read", async (data) => {
    try {
      const { receiver_id, sender_id } = data;
      if (!receiver_id || !sender_id)
        throw new Error(
          "Eksik veya geçersiz alanlar: receiver_id veya sender_id"
        );

      const now = new Date();
      await client.query(
        `UPDATE messages SET status = 'read', read_at = $1 WHERE sender_id = $2 AND receiver_id = $3 AND status != 'read'`,
        [now, sender_id, receiver_id]
      );
      io.to(`user_${sender_id}`).emit("messages_read", {
        receiver_id: receiver_id,
      });

      await createNotification({
        userId: sender_id,
        senderId: socket.user.id,
        type: NOTIFICATION_TYPES.MESSAGE_READ,
        content: "Messages read",
        data: {
          read_at: now,
        },
      });
    } catch (error) {
      console.error("[SOCKET] Mark read error:", error);
      socket.emit("read_error", {
        message: "Failed to mark messages as read",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });

  socket.on("typing", (data) => {
    try {
      const { receiver_id } = data;
      if (!receiver_id) {
        throw new Error("Missing required field: receiver_id");
      }
      io.to(`user_${receiver_id}`).emit("typing", {
        sender_id: socket.user.id,
        receiver_id: receiver_id,
      });
    } catch (error) {
      console.error("[SOCKET] Typing indicator error:", error);
    }
  });

  socket.on("stop_typing", (data) => {
    try {
      const { receiver_id } = data;
      io.to(`user_${receiver_id}`).emit("stop_typing", {
        sender_id: socket.user.id,
        receiver_id: receiver_id,
      });
    } catch (error) {
      console.error("[SOCKET] Stop typing error:", error);
    }
  });

  // Grup mesajı gönderme
  socket.on("group_message", async (msg) => {
    try {
      const result = await client.query(
        ` 
                INSERT INTO group_messages (group_id, sender_id, content, status) 
                VALUES ($1, $2, $3, 'sent') RETURNING * 
            `,
        [msg.groupId, socket.user.id, msg.content]
      );

      const savedMesssage = result.rows[0];
      io.to(`group_${msg.groupId}`).emit("group_message", savedMesssage);
    } catch (error) {
      console.error("[SOCKET] Group message error:", error);
      socket.emit("group_message_error", {
        message: "Failed to send group message",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });

  socket.on("group_read", async (data) => {
    const last = await client.query(
      `select id from group_messages where group_id = $1 order by id desc limit 1`,
      [data.groupId]
    );
    const lastId = last.rows && last.rows.length > 0 ? last.rows[0].id : null;
    await client.query(
      `update group_members set last_read_message_id = $1,
        last_read_at = NOW(), unread_count = 0 where group_id = $2 and user_id = $3`,
      [lastId, data.groupId, socket.user.id]
    );
  });

  socket.on("file_message", async (data) => {
    const { senderId, receiverId, fileKey, fileType } = data;
    if (!senderId || !receiverId || !fileKey || !fileType) {
      return socket.emit("message_error", {
        message: "Missing required fields for file message",
      });
    }
    const result = await client.query(
      "INSERT INTO messages (sender_id, receiver_id, file_key, file_type) VALUES ($1,$2,$3,$4) RETURNING *",
      [senderId, receiverId, fileKey, fileType]
    );
    const msg = result.rows[0];
    const fileUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.S3_BUCKET_FILENAME,
      Key: msg.file_key,
      Expires: 600, // 10 dakika geçerli
    });
    msg.file_url = fileUrl;
    console.log("Mesaj urlsiii", msg.file_url);
    socket.emit("message_sent", msg);
    io.to(`user_${receiverId}`).emit("new_message", msg);
  });

  socket.on("group_file_message", async (data) => {
    const { senderId, groupId, fileKey, fileType } = data;
    if (!senderId || !groupId || !fileKey || !fileType) {
      return socket.emit("message_error", {
        message: "Missing required fields for file message",
      });
    }
    const result = await client.query(
      "INSERT INTO group_messages (sender_id, group_id, file_key, file_type) VALUES ($1,$2,$3,$4) RETURNING *",
      [senderId, groupId, fileKey, fileType]
    );
    const msg = result.rows[0];
    const fileUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.S3_BUCKET_FILENAME,
      Key: msg.file_key,
      Expires: 600, // 10 dakika geçerli
    });
    msg.file_url = fileUrl;
    io.to(`group_${groupId}`).emit("group_message", msg);
  });

  // Bağlantı kesilmesi
  socket.on("disconnect", async () => {
    console.log(`[SOCKET] User disconnected: ${socket.user.id}`);
    global.connectedUsers.delete(socket.user.id);
    io.emit("offline", { id: socket.user.id });
    await client.query(
      `UPDATE users SET last_seen = NOW(), is_online = FALSE WHERE id = $1`,
      [socket.user.id]
    );
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
      console.log("[API] HTTP server closed");
      client
        .end()
        .then(() => {
          console.log("[API] Database connection closed");
          process.exit(0);
        })
        .catch((err) => {
          console.error("[API] Error closing database connection:", err);
          process.exit(1);
        });
    });
  });
};

gracefulShutdown("SIGINT");
gracefulShutdown("SIGTERM");

// Sunucuyu başlatma
server.listen(port, "0.0.0.0", () => {
  console.log(`[API] Server running on port ${port}`);
  console.log(`[API] Mode: ${process.env.NODE_ENV || "Development"}`);
  console.log(
    `[API] Health check available at: http://localhost:${port}/health`
  );
});
