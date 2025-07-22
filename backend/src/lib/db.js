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

client.connect()
    .then(() => console.log("[DB] Database connection successful."))
    .catch(err => {
        console.error("[DB] Database connection failed!", err);
        process.exit(1);
    });

export default client;

