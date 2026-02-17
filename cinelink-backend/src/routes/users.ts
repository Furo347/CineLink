import { Router } from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import {
    searchUsers,
    getUserProfile,
    getUserFavorites,
    getUserComments,
    getAllUsers,
} from "../controllers/usersController";

const router = Router();

router.get("/", authMiddleware, searchUsers);
router.get("/all", authMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUserProfile);
router.get("/:id/favorites", authMiddleware, getUserFavorites);
router.get("/:id/comments", authMiddleware, getUserComments);

export default router;
