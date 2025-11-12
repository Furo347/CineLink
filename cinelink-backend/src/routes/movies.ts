import { Router } from "express";
import { getPopularMovies, searchMovies } from "../controllers/movieController";

const router = Router();

router.get("/", getPopularMovies);
router.get("/search", searchMovies);

export default router;
