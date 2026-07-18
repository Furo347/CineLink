import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/requireAdmin";
import { deleteAnyComment, deleteUserAsAdmin, getAdminStats } from "../controllers/adminController";

const router = Router();

router.use(authMiddleware, requireAdmin);

router.get("/stats", getAdminStats);
router.delete("/comments/:commentId", deleteAnyComment);
router.delete("/users/:userId", deleteUserAsAdmin);

export default router;
