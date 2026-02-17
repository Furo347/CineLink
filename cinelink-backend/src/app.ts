import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth";
import moviesRoutes from "./routes/movies";
import favoriteRoutes from "./routes/favorites";
import searchRoutes from "./routes/search";
import commentRoutes from "./routes/comments";
import followRoutes from "./routes/follow";
import feedRoutes from "./routes/feed";
import usersRoutes from "./routes/users";

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
app.use("/api/users", usersRoutes);

export default app;
