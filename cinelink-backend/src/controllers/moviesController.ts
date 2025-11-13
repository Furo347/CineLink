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

export const getMovieDetails = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "L'ID du film est requis" });
    }

    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${id}`,
            {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: "fr-FR",
                    append_to_response: "credits,videos",
                },
            }
        );

        const movie = response.data;

        res.json({
            tmdbId: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null,
            backdrop: movie.backdrop_path
                ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                : null,
            release_date: movie.release_date,
            runtime: movie.runtime,
            genres: movie.genres.map((g: any) => g.name),
            vote_average: movie.vote_average,
            credits: movie.credits ? movie.credits.cast.slice(0, 5).map((c: any) => ({
                name: c.name,
                character: c.character,
                profile_path: c.profile_path
                    ? `https://image.tmdb.org/t/p/w200${c.profile_path}`
                    : null,
            })) : [],
            videos: movie.videos ? movie.videos.results.filter((v: any) => v.type === "Trailer") : [],
        });
    } catch (err) {
        console.error("Erreur lors de la récupération du film:", err);
        res.status(500).json({ message: "Erreur lors de la récupération du film" });
    }
};
