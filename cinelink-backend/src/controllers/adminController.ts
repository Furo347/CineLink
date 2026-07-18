import { Request, Response } from "express";
import mongoose from "mongoose";
import Activity from "../models/Activity";
import Comment from "../models/Comment";
import Favorite from "../models/Favorite";
import Follow from "../models/Follow";
import User from "../models/User";
import { logger } from "../config/logger";

export const getAdminStats = async (_req: Request, res: Response) => {
    try {
        const [users, comments, favorites, follows] = await Promise.all([
            User.countDocuments(),
            Comment.countDocuments(),
            Favorite.countDocuments(),
            Follow.countDocuments(),
        ]);

        return res.json({ users, comments, favorites, follows });
    } catch (error) {
        logger.error("Erreur getAdminStats", { error });
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

export const deleteAnyComment = async (req: Request, res: Response) => {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({ message: "Identifiant de commentaire invalide" });
    }

    try {
        const deleted = await Comment.findByIdAndDelete(commentId);

        if (!deleted) {
            return res.status(404).json({ message: "Commentaire introuvable" });
        }

        await Activity.deleteMany({
            type: "COMMENT_MOVIE",
            actor: deleted.user,
            targetMovie: deleted.movieId,
            $or: [
                { "payload.comment._id": deleted._id },
                { "payload.comment": deleted._id },
                { "payload.comment.content": deleted.content },
                { "payload.comment": deleted.content },
            ],
        });

        return res.status(204).send();
    } catch (error) {
        logger.error("Erreur deleteAnyComment", { error });
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

export const deleteUserAsAdmin = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const currentUserId = (req as any).user?.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Identifiant utilisateur invalide" });
    }

    if (currentUserId && currentUserId === userId) {
        return res.status(400).json({ message: "Un administrateur ne peut pas supprimer son propre compte" });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        await Promise.all([
            Comment.deleteMany({ user: user._id }),
            Favorite.deleteMany({ user: user._id }),
            Follow.deleteMany({ $or: [{ follower: user._id }, { following: user._id }] }),
            Activity.deleteMany({ $or: [{ actor: user._id }, { targetUser: user._id }] }),
        ]);
        await user.deleteOne();

        return res.json({
            message: "Utilisateur supprimé",
            cleanup: {
                comments: "supprimés",
                favorites: "supprimés",
                follows: "relations entrantes et sortantes supprimées",
                activities: "activités liées à l'utilisateur supprimées",
            },
        });
    } catch (error) {
        logger.error("Erreur deleteUserAsAdmin", { error });
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
