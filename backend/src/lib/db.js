import { Client } from "pg";

const client = Client({
    user: "postgres",
    host: "localhost",
    database:"chat_app",  //database ismi
    password:"chatapp123", //database sifresi
    port: "5432",
});

client.connect(()=>{
    try {
        console.log("Succesfully connected to database")
    } catch (err) {
        console.log("Database connection is failed.", err);
    }
});

export default client;