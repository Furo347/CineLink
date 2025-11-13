import express from "express";
import { getPopularMovies } from "../controllers/moviesController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/popular", authMiddleware, getPopularMovies);

export default router;
