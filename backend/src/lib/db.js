import {Client} from "pg";
import logger from "../utils/logger.js";

const client = new Client({
    user: "postgres",
    host: "localhost",
    database:"chat_app",
    password:"chatapp123",
    port: "5432",
});

client.connect()
    .then(() => logger.info("Database connection successfull."))
    .catch(err => logger.error("Database connection failed!", err));

export default client;

