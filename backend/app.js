import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from 'url';
import authRoutes from "./src/routes/auth.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import { errorHandler } from "./src/middlewares/error.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5001;

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5001",
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.RATE_LIMIT || 100
});

app.use(limiter);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get("/health", (req, res) => {
    console.log(`[API] GET /health [200] Health check`);
    res.status(200).json({ 
        status: "UP", 
        timestamp: new Date(),
        environment: process.env.NODE_ENV || "Development",
        version: process.env.npm_package_version
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

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    app.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Mode: ${process.env.NODE_ENV || "Development"}`);
});
