import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import Favorite from "../models/Favorite";
import Comment from "../models/Comment";
import Follow from "../models/Follow";
import axios from "axios";
import { validationResult } from "express-validator";

async function fetchMovieDetails(tmdbId: number) {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
            params: { api_key: process.env.TMDB_API_KEY, language: "fr-FR" },
        });
        return response.data;
    } catch (err) {
        console.error(`Erreur TMDB pour ${tmdbId}:`, err);
        return null;
    }
}

export const getAllUsers = async (req: any, res: Response) => {
    try {
        const limit = Math.min(
            parseInt((req.query.limit as string) || "50", 10),
            100
        );

        const users = await User.find()
            .select("_id name email avatar")
            .limit(limit)
            .sort({ createdAt: -1 });

        res.json(
            users.map((u) => ({
                id: u._id,
                name: u.name,
                email: u.email,
                avatar: u.avatar,
            }))
        );
    } catch (err) {
        console.error("Erreur getAllUsers:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const searchUsers = async (req: Request, res: Response) => {
    try {
        const query = (req.query.query as string | undefined)?.trim() ?? "";
        const limit = Math.min(parseInt((req.query.limit as string) || "10", 10), 30);

        if (!query) return res.json([]);

        const regex = new RegExp(query, "i");

        const users = await User.find({
            $or: [{ name: regex }, { email: regex }],
        })
            .select("_id name email avatar")
            .limit(limit);

        res.json(
            users.map((u) => ({
                id: u._id,
                name: u.name,
                email: u.email,
                avatar: u.avatar
            }))
        );
    } catch (err) {
        console.error("Erreur searchUsers:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getUserProfile = async (req: any, res: Response) => {
    try {
        const userIdParam = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userIdParam)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }

        const user = await User.findById(userIdParam).select("_id name email avatar");
        if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

        const followersCount = await Follow.countDocuments({ following: user._id });
        const followingCount = await Follow.countDocuments({ follower: user._id });

        const viewerId = req.user?.id;
        const isFollowing = viewerId
            ? !!(await Follow.findOne({ follower: viewerId, following: user._id }))
            : false;

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            followersCount,
            followingCount,
            isFollowing,
        });
    } catch (err) {
        console.error("Erreur getUserProfile:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getUserFavorites = async (req: Request, res: Response) => {
    try {
        const userIdParam = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userIdParam)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }

        const favorites = await Favorite.find({ user: userIdParam }).sort({ createdAt: -1 });

        if (!favorites.length) return res.json([]);

        const enriched = await Promise.all(
            favorites.map(async (fav) => {
                const movie = await fetchMovieDetails(fav.tmdbId);

                return {
                    _id: fav._id,
                    tmdbId: fav.tmdbId,
                    title: movie?.title ?? fav.title,
                    poster: movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                    overview: movie?.overview ?? "Aucune description disponible",
                    vote_average: movie?.vote_average ?? null,
                    rating: fav.rating ?? null,
                    createdAt: fav.createdAt,
                };
            })
        );

        res.json(enriched);
    } catch (err) {
        console.error("Erreur getUserFavorites:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getUserComments = async (req: Request, res: Response) => {
    try {
        const userIdParam = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userIdParam)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }

        const comments = await Comment.find({ user: userIdParam })
            .sort({ createdAt: -1 })
            .select("_id movieId content createdAt user");

        res.json(
            comments.map((c) => ({
                id: c._id,
                movieId: c.movieId,
                content: c.content,
                createdAt: c.createdAt,
                user: c.user,
            }))
        );
    } catch (err) {
        console.error("Erreur getUserComments:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const updateMyAvatar = async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userId = req.user?.id;
        const { avatar } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { avatar },
            { new: true }
        ).select("_id name email avatar");

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.json({
            message: "Avatar mis à jour",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            },
        });
    } catch (err) {
        console.error("Erreur updateMyAvatar:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const updateMyProfile = async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userId = req.user?.id;
        const { name, avatar } = req.body;

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (avatar !== undefined) updateData.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select("_id name email avatar");

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.json({
            message: "Profil mis à jour",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            },
        });
    } catch (err) {
        console.error("Erreur updateMyProfile:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

