import { Request, Response } from "express";

export const getPopularMovies = async (req: Request, res: Response) => {
    return res.json({ message: "Liste des films populaires (mock)" });
};

export const searchMovies = async (req: Request, res: Response) => {
    const query = req.query.q || "";
    return res.json({ message: `Résultats pour la recherche : ${query}` });
};
