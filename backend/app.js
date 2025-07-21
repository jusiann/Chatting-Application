import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./src/routes/auth.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import { errorHandler } from "./src/middlewares/error.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5001",
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => {
    console.log(`[API] GET /health [200] Health check`);
    res.status(200).json({ 
        status: "UP", 
        timestamp: new Date(),
        environment: process.env.NODE_ENV || "Development"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.use((req, res) => {
    console.log(`[API] ${req.method} ${req.originalUrl} [404] Not found`);
    res.status(404).json({
        success: false,
        message: "Endpoint not found"
    });
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Mode: ${process.env.NODE_ENV || "Development"}`);
});
