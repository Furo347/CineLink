import { Router } from "express";
import {addComment, deleteComment, getCommentsByMovie} from "../controllers/commentController";
import {authMiddleware} from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, addComment);
router.get("/:movieId", getCommentsByMovie);
router.delete("/:id", authMiddleware, deleteComment)

export default router;
