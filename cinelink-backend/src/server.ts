import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import moviesRoutes from "./routes/movies";
import favoriteRoutes from "./routes/favorites";
import searchRoutes from "./routes/search";
import commentRoutes from "./routes/comments";
import followRoutes from "./routes/follow";
import feedRoutes from "./routes/feed";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/feed", feedRoutes);

const PORT = process.env.PORT || 3000;

const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

start();

export default app;
