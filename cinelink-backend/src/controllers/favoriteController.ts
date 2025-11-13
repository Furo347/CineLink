import { Response } from "express";
import Favorite from "../models/Favorite";
import { AuthRequest } from "../middlewares/authMiddleware";
import mongoose from "mongoose";
import axios from "axios";

async function fetchMovieDetails(tmdbId: number) {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${process.env.TMDB_API_KEY}&language=fr-FR`
        );
        return response.data;
    } catch (err) {
        console.error(`Erreur TMDB pour le film ${tmdbId}:`, err);
        return null;
    }
}

export const getFavorites = async (req: any, res: Response) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const favorites = await Favorite.find({ user: userId });

        if (!favorites.length) {
            return res.json([]);
        }

        const enrichedFavorites = await Promise.all(
            favorites.map(async (fav) => {
                const movie = await fetchMovieDetails(fav.tmdbId);

                return {
                    _id: fav._id,
                    tmdbId: fav.tmdbId,
                    title: movie?.title ?? fav.title,
                    poster: movie?.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : null,
                    overview: movie?.overview ?? "Aucune description disponible",
                    vote_average: movie?.vote_average ?? null,
                    rating: fav.rating ?? null
                };
            })
        );

        res.json(enrichedFavorites);
    } catch (err) {
        console.error("Erreur serveur:", err);
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

        const favorite = new Favorite({ user: userId, tmdbId, title });
        await favorite.save();

        res.status(201).json({ message: "Favori ajouté", favorite });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const deleteFavorite = async (req: any, res: Response) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const favoriteId = req.params.id;

        const favorite = await Favorite.findOne({ _id: favoriteId, user: userId });

        if (!favorite) {
            return res.status(404).json({ message: "Favori introuvable ou non autorisé" });
        }

        await Favorite.deleteOne({ _id: favoriteId });
        res.json({ message: "Favori supprimé avec succès" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const rateFavorite = async (req: any, res: Response) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const favoriteId = req.params.id;
        const { rating } = req.body;

        if (rating === undefined || rating < 0 || rating > 10) {
            return res.status(400).json({ message: "La note doit être comprise entre 0 et 10." });
        }

        const favorite = await Favorite.findOne({ _id: favoriteId, user: userId });
        if (!favorite) {
            return res.status(404).json({ message: "Favori introuvable ou non autorisé." });
        }

        favorite.rating = rating;
        await favorite.save();

        res.json({ message: "Note enregistrée avec succès.", favorite });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};
