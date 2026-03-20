import { Router } from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import {
    searchUsers,
    getUserProfile,
    getUserFavorites,
    getUserComments,
    getAllUsers,
    updateMyAvatar,
    updateMyProfile,
} from "../controllers/usersController";
import {body} from "express-validator";

const router = Router();

router.get("/all", authMiddleware, getAllUsers);
router.put(
    "/me/avatar",
    authMiddleware,
    [
        body("avatar")
            .isIn(["avatar1", "avatar2", "avatar3", "avatar4", "avatar5"])
            .withMessage("Avatar invalide"),
    ],
    updateMyAvatar
);

router.put(
    "/me",
    authMiddleware,
    [
        body("name")
            .optional()
            .isString()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("Le nom doit contenir entre 2 et 50 caractères"),
        body("avatar")
            .optional()
            .isIn(["avatar1", "avatar2", "avatar3", "avatar4", "avatar5"])
            .withMessage("Avatar invalide"),
    ],
    updateMyProfile
);
router.get("/", authMiddleware, searchUsers);
router.get("/:id", authMiddleware, getUserProfile);
router.get("/:id/favorites", authMiddleware, getUserFavorites);
router.get("/:id/comments", authMiddleware, getUserComments);

export default router;
