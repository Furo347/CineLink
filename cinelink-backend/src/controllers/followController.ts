import { Response } from "express";
import Follow from "../models/Follow";
import { AuthRequest } from "../middlewares/authMiddleware";
import mongoose from "mongoose";
import {logActivity} from "../utils/activityLogger";

export const followUser = async (req: AuthRequest, res: Response) => {
    try {
        const followerId = new mongoose.Types.ObjectId(req.userId);
        const followingId = new mongoose.Types.ObjectId(req.params.id);

        if (followerId.equals(followingId)) {
            return res.status(400).json({ message: "Impossible de se suivre soi-même" });
        }

        const exists = await Follow.findOne({ follower: followerId, following: followingId });
        if (exists) {
            return res.status(400).json({ message: "Déjà suivi" });
        }

        const relation = new Follow({ follower: followerId, following: followingId });
        await relation.save();

        await logActivity({
            actor: followerId.toString(),
            type: "FOLLOW_USER",
            targetUser: followingId.toString()
        });


        res.status(201).json({ message: "Utilisateur suivi" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const unfollowUser = async (req: AuthRequest, res: Response) => {
    try {
        const followerId = new mongoose.Types.ObjectId(req.userId);
        const followingId = new mongoose.Types.ObjectId(req.params.id);

        const deleted = await Follow.findOneAndDelete({
            follower: followerId,
            following: followingId
        });

        if (!deleted) {
            return res.status(404).json({ message: "Relation inexistante" });
        }

        res.json({ message: "Utilisateur désuivi" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getFollowing = async (req: AuthRequest, res: Response) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);

        const following = await Follow.find({ follower: userId })
            .populate("following", "name email");

        res.json(following);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
