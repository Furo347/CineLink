import { Response } from "express";
import Favorite from "../models/Favorite";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getFavorites = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const favorites = await Favorite.find({ user:userId });
        console.log("userId envoyé au find():", req.user.id);
        res.json(favorites);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const addFavorite = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { tmdbId, title } = req.body;

        if (!tmdbId) {
            return res.status(400).json({ message: "tmdbId est requis" });
        }

        const existing = await Favorite.findOne({ user: userId, tmdbId });
        if (existing) {
            return res.status(400).json({ message: "Ce film est déjà dans vos favoris" });
        }

        const favorite = new Favorite({
            user: userId,
            tmdbId,
            title
        });

        await favorite.save();

        res.status(201).json({ message: "Favori ajouté", favorite });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
