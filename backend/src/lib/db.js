import {Client} from "pg";
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "chat_app",
    password: process.env.DB_PASSWORD || "chatapp123",
    port: process.env.DB_PORT || "5432"
});

export const NOTIFICATION_TYPES = {
    NEW_MESSAGE: 'new_message',
    MESSAGE_READ: 'message_read',
    MESSAGE_DELIVERED: 'message_delivered',
    MENTION: 'mention',
    GROUP_INVITE: 'group_invite',
    GROUP_MESSAGE: 'group_message'
};

const createUsersTable = async () => {
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(256) NOT NULL,
                title VARCHAR(100),
                department VARCHAR(100),
                profile_pic TEXT,
                reset_code VARCHAR(32),
                reset_time TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("[DB] Users table checked/created successfully");
    } catch (error) {
        console.error("[DB] Error creating users table:", error);
    }
};

const createMessagesTable = async () => {
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender_id INTEGER NOT NULL REFERENCES users(id),
                receiver_id INTEGER NOT NULL REFERENCES users(id),
                content TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'sent',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                delivered_at TIMESTAMP,
                read_at TIMESTAMP,
                CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
            CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
            CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
        `);

        console.log("[DB] Messages table checked/created successfully");
    } catch (error) {
        console.error("[DB] Error creating messages table:", error);
    }
};

const createNotificationsTable = async () => {
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                type VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                data JSONB DEFAULT '{}'::jsonb,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                read_at TIMESTAMP,
                CONSTRAINT valid_notification_type CHECK (
                    type IN ('new_message', 'message_read', 'message_delivered', 
                            'mention', 'group_invite', 'group_message')
                )
            )
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
            CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
            CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
        `);

        console.log("[DB] Notifications table checked/created successfully");
    } catch (error) {
        console.error("[DB] Error creating notifications table:", error);
    }
};

client.connect()
    .then(() => {
        console.log("[DB] Database connection successful.");
        createUsersTable()
            .then(() => createMessagesTable())
            .then(() => createNotificationsTable())
            .catch(err => {
                console.error("[DB] Error initializing database tables:", err);
                process.exit(1);
            });
    })
    .catch(err => {
        console.error("[DB] Database connection failed!", err);
        process.exit(1);
    });

export default client;

