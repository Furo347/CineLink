import { Response } from "express";
import axios from "axios";
import Activity from "../models/Activity";
import Follow from "../models/Follow";
import { AuthRequest } from "../middlewares/authMiddleware";

async function fetchMovieDetails(tmdbId: number) {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${tmdbId}`,
            {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: "fr-FR",
                },
            }
        );

        const movie = response.data;

        return {
            tmdbId: movie.id,
            title: movie.title,
            poster: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null,
            overview: movie.overview,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
        };
    } catch (err) {
        console.error(`Erreur TMDB feed pour ${tmdbId}:`, err);
        return null;
    }
}

export const getFeed = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const following = await Follow.find({ follower: userId }).select("following");
        const followingIds = following.map((f) => f.following);

        const activities = await Activity.find({
            actor: { $in: followingIds },
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("actor", "name email avatar")
            .populate("targetUser", "name email avatar");

        const enrichedActivities = await Promise.all(
            activities.map(async (activity) => {
                const movie =
                    activity.targetMovie !== undefined
                        ? await fetchMovieDetails(activity.targetMovie)
                        : null;

                return {
                    id: activity._id,
                    type: activity.type,
                    actor: activity.actor,
                    targetUser: activity.targetUser ?? null,
                    targetMovie: activity.targetMovie ?? null,
                    movie,
                    payload: activity.payload ?? null,
                    createdAt: activity.createdAt,
                };
            })
        );

        res.json(enrichedActivities);
    } catch (error) {
        console.error("Erreur getFeed:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
