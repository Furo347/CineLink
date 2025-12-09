import { Router } from "express";
import { followUser, unfollowUser, getFollowing } from "../controllers/followController";
import {authMiddleware} from "../middlewares/authMiddleware";

const router = Router();

router.post("/:id", authMiddleware, followUser);
router.delete("/:id", authMiddleware, unfollowUser);
router.get("/", authMiddleware, getFollowing);

export default router;
