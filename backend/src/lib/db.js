
import { Client } from "pg";

const client = new Client({
    user: "postgres",
    host: "localhost",
    database:"chat_app",  //database ismi
    password:"chatapp123", //database sifresi
    port: "5432",
});

client.connect()
    .then(() => console.log("Successfully connected to Database"))
    .catch(err => console.error("Database connection failed", err));

export default client;

