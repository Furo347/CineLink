import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import { AuthRequest } from "./authMiddleware";
import { logger } from "../config/logger";

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId ?? (req as any).user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Authentification requise" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(401).json({ message: "Utilisateur invalide" });
    }

    try {
        const user = await User.findById(userId).select("_id role");

        if (!user) {
            return res.status(401).json({ message: "Utilisateur introuvable" });
        }

        if (user.role !== "ADMIN") {
            return res.status(403).json({ message: "Accès administrateur requis" });
        }

        return next();
    } catch (error) {
        logger.error("Erreur requireAdmin", { error });
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
