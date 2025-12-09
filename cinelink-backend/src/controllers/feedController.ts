import { Response } from "express";
import Activity from "../models/Activity";
import Follow from "../models/Follow";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getFeed = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        const following = await Follow.find({ follower: userId }).select("following");

        const followingIds = following.map(f => f.following);

        const activities = await Activity.find({
            actor: { $in: followingIds }
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("actor", "name email")
            .populate("targetUser", "name email");

        res.json(activities);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
