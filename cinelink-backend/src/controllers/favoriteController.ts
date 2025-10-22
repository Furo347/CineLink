import { Request, Response } from "express";

export const addFavorite = async (req: Request, res: Response) => {
    const { tmdbId, title } = req.body;
    return res.status(201).json({ message: `Film ajouté aux favoris : ${title || tmdbId}` });
};

export const getFavorites = async (req: Request, res: Response) => {
    return res.json({ message: "Liste des favoris (mock)" });
};

export const removeFavorite = async (req: Request, res: Response) => {
    const { tmdbId } = req.params;
    return res.json({ message: `Favori supprimé : ${tmdbId}` });
};
