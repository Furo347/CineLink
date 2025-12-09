import { Router } from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import { getFeed } from "../controllers/feedController";

const router = Router();

router.get("/", authMiddleware, getFeed);

export default router;
