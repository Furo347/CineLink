import { Request, Response } from "express";
import axios from "axios";

export const searchMovies = async (req: Request, res: Response) => {
    const query = req.query.query as string;

    if (!query) {
        return res.status(400).json({ message: "Le paramètre 'query' est requis" });
    }

    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/search/movie`,
            {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    query,
                    language: "fr-FR",
                },
            }
        );

        const movies = response.data.results.map((movie: any) => ({
            tmdbId: movie.id,
            title: movie.title,
            poster: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null,
            overview: movie.overview,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
        }));

        res.json(movies);
    } catch (err) {
        console.error("Erreur TMDB:", err);
        res.status(500).json({ message: "Erreur lors de la recherche de films" });
    }
};
