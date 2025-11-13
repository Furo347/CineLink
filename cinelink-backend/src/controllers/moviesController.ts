import { Request, Response } from "express";
import axios from "axios";

export const getPopularMovies = async (req: Request, res: Response) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/popular`,
            {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: "fr-FR",
                    page: 1,
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
        console.error("Erreur lors de la récupération des films populaires:", err);
        res.status(500).json({ message: "Erreur lors de la récupération des films populaires" });
    }
};
