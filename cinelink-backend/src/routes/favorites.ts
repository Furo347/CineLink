import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {addFavorite, deleteFavorite, getFavorites, rateFavorite} from "../controllers/favoriteController";

const router = Router();

router.post("/", authMiddleware, addFavorite);
router.get("/", authMiddleware, getFavorites);
router.delete("/:id", authMiddleware, deleteFavorite);
router.put("/:id/rate", authMiddleware, rateFavorite);

export default router;
