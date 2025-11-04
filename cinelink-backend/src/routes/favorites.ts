import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { addFavorite} from "../controllers/favoriteController";

const router = Router();

router.post("/", authMiddleware, addFavorite);
//router.get("/", authMiddleware, getFavorites);
//router.delete("/:tmdbId", authMiddleware, removeFavorite);

export default router;
