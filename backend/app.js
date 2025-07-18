import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import logger from "./src/utils/logger.js";
import authRoutes from "./src/routes/auth.routes.js";
import messageRoutes from "./src/routes/message.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
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
    logger.api("GET", "/health", 200, "Health check");
    res.status(200).json({ 
        status: "UP", 
        timestamp: new Date(),
        environment: process.env.NODE_ENV || "Development"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.use((req, res) => {
    logger.api(req.method, req.originalUrl, 404, "Not found");
    res.status(404).json({
        success: false,
        message: "Endpoint not found"
    });
});

app.use((err, req, res, next) => {
    logger.logError("EXPRESS", {
        path: req.path,
        method: req.method,
        error: err.message
    });
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Server error occurred",
        error: process.env.NODE_ENV === "development" ? err : {}
    });
});

app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info(`Mode: ${process.env.NODE_ENV || "Development"}`);
});
