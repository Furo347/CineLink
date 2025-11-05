import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {addFavorite, deleteFavorite, getFavorites} from "../controllers/favoriteController";

const router = Router();

router.post("/", authMiddleware, addFavorite);
router.get("/", authMiddleware, getFavorites);
router.delete("/:id", authMiddleware, deleteFavorite);

export default router;
