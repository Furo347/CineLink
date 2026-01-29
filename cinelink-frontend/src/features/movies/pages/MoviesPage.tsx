import { useEffect, useState } from "react";
import { moviesApi } from "../services/movies.api";
import type { Movie } from "../types";

export default function MoviesPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        moviesApi
            .getAll()
            .then(setMovies)
            .catch(() => setError("Erreur lors du chargement des films"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Chargement...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-6">Catalogue CineLink</h1>

            <ul className="grid gap-4">
                {movies.map((movie) => (
                    <li
                        key={movie.id}
                        className="border border-gray-700 rounded p-4 hover:bg-gray-900"
                    >
                        <h2 className="text-xl font-semibold">{movie.title}</h2>
                        <p className="text-gray-400">{movie.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
