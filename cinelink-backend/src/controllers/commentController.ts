import { Response } from "express";
import mongoose from "mongoose";
import Comment from "../models/Comment";
import { AuthRequest } from "../middlewares/authMiddleware";

export const addComment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { movieId, content } = req.body;

        if (!movieId || !content || content.trim().length === 0) {
            return res.status(400).json({ message: "movieId et content sont requis" });
        }

        const comment = new Comment({
            user: new mongoose.Types.ObjectId(userId),
            movieId,
            content,
        });

        await comment.save();

        res.status(201).json({
            message: "Commentaire ajouté",
            comment,
        });
    } catch (err) {
        console.error("Erreur serveur:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getCommentsByMovie = async (req: any, res: Response) => {
    try {
        const movieId = req.params.movieId;

        if (!movieId) {
            return res.status(400).json({ message: "movieId manquant" });
        }

        const comments = await Comment.find({ movieId })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (err) {
        console.error("Erreur serveur:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const deleteComment = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const commentId = req.params.id;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Commentaire introuvable" });
        }

        if (comment.user.toString() !== userId) {
            return res.status(403).json({ message: "Non autorisé" });
        }

        await comment.deleteOne();

        res.json({ message: "Commentaire supprimé" });
    } catch (err) {
        console.error("Erreur serveur:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

