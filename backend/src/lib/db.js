import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "chat_app",
  password: process.env.DB_PASSWORD || "chatapp123",
  port: process.env.DB_PORT || "5432",
});

export const NOTIFICATION_TYPES = {
  NEW_MESSAGE: "new_message",
  MESSAGE_READ: "message_read",
  MESSAGE_DELIVERED: "message_delivered",
  MENTION: "mention",
  GROUP_INVITE: "group_invite",
  GROUP_MESSAGE: "group_message",
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
                profile_pic_id VARCHAR(100),
                reset_code VARCHAR(32),
                reset_time TIMESTAMP,
                failed_login_attempts INTEGER DEFAULT 0,
                last_failed_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Eğer kolonlar yoksa ekle
    await client.query(`
            DO $$ 
            BEGIN 
                BEGIN
                    ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
                EXCEPTION
                    WHEN duplicate_column THEN 
                        NULL;
                END;
                
                BEGIN
                    ALTER TABLE users ADD COLUMN last_failed_login TIMESTAMP;
                EXCEPTION
                    WHEN duplicate_column THEN 
                        NULL;
                END;
            END $$;
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
            CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
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

const createGroupsTable = async () => {
  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS groups (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                created_by INTEGER NOT NULL REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_groups_name ON groups(name);
            CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
            CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at);
        `);
    console.log("[DB] Groups table checked/created successfully");
  } catch (error) {
    console.error("[DB] Error creating groups table:", error);
  }
};

const createGroupMembersTable = async () => {
  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS group_members (
                id SERIAL PRIMARY KEY,
                group_id INTEGER NOT NULL REFERENCES groups(id),
                user_id INTEGER NOT NULL REFERENCES users(id),
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                role VARCHAR(20) NOT NULL DEFAULT 'member',
                last_read_message_id BIGINT,
                last_read_at TIMESTAMPTZ,
                unread_count INT NOT NULL DEFAULT 0
            )
        `);
    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
            CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
            CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role);
        `);
    console.log("[DB] Group members table checked/created successfully");
  } catch (error) {
    console.error("[DB] Error creating group members table:", error);
  }
};

const createGroupMessagesTable = async () => {
  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS group_messages (
                id SERIAL PRIMARY KEY,
                group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
                sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'sent',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);
    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
            CREATE INDEX IF NOT EXISTS idx_group_messages_sender_id ON group_messages(sender_id);
            CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at);
            CREATE INDEX IF NOT EXISTS idx_messages_group_id_id ON group_messages(group_id, id);
        `);
    console.log("[DB] Group messages table checked/created successfully");
  } catch (error) {
    console.error("[DB] Error creating group messages table:", error);
  }
};

client.connect();
/* .then(() => {
        console.log("[DB] Database connection successful.");
        createUsersTable()
            .then(() => createMessagesTable())
            .then(() => createNotificationsTable())
            .then(() => createGroupsTable())
            .then(() => createGroupMembersTable())
            .then(() => createGroupMessagesTable())
            .catch(err => {
                console.error("[DB] Error initializing database tables:", err);
                process.exit(1);
            });
    })
    .catch(err => {
        console.error("[DB] Database connection failed!", err);
        process.exit(1);
    }); */

export default client;
