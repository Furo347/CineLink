import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import authRoutes from "./routes/auth";
import moviesRoutes from "./routes/movies";
import favoriteRoutes from "./routes/favorites";
import searchRoutes from "./routes/search";
import commentRoutes from "./routes/comments";
import followRoutes from "./routes/follow";
import feedRoutes from "./routes/feed";
import usersRoutes from "./routes/users";
import healthRoutes from "./routes/health";
import { logger } from "./config/logger";


const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json());
app.use(helmet());
app.use(
    morgan("combined", {
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    })
);

// routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/users", usersRoutes);

export default app;
