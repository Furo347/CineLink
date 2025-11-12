import express from "express";
import { searchMovies } from "../controllers/searchController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, searchMovies);

export default router;
