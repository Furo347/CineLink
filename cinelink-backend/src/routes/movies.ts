import express from "express";
import {getMovieDetails, getPopularMovies} from "../controllers/moviesController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/popular", authMiddleware, getPopularMovies);
router.get("/:id", authMiddleware, getMovieDetails);

export default router;
