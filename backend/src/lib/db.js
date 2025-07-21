import {Client} from "pg";

const client = new Client({
    user: "postgres",
    host: "localhost",
    database:"chat_app",
    password:"chatapp123",
    port: "5432",
});

client.connect()
    .then(() => console.log("[DB] Database connection successful."))
    .catch(err => console.error("[DB] Database connection failed!", err));

export default client;

