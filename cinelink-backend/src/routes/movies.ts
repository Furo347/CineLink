import { Router } from "express";
import { getPopularMovies, searchMovies } from "../controllers/movieController";

const router = Router();

router.get("/", getPopularMovies); // GET /api/movies
router.get("/search", searchMovies); // GET /api/movies/search?q=...

export default router;
