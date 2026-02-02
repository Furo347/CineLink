import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { moviesApi } from "../movies.api";
import type { Movie } from "../movies.types";
import MovieGrid from "../components/MovieGrid";
import { Skeleton } from "@/components/ui/skeleton";
import SearchSpotlight from "@/features/search/components/SearchSpotlight";


function MoviesSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <Skeleton className="aspect-[2/3] w-full" />
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function MoviesPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [q] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        moviesApi
            .getPopular()
            .then(setMovies)
            .catch(() => toast.error("Impossible de charger le catalogue"))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return movies;
        return movies.filter((m) => m.title.toLowerCase().includes(needle));
    }, [movies, q]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Catalogue</h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Explore, ajoute en favoris, commente et construis ton feed.
                    </p>
                </div>

                <div className="relative w-full sm:w-[340px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <div className="w-full sm:w-[360px]">
                        <SearchSpotlight placeholder="Rechercher un film… (global TMDB)" />
                    </div>

                </div>

            </div>

            {loading ? (
                <MoviesSkeleton />
            ) : movies.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                    <p className="text-text-primary text-lg font-semibold">Catalogue indisponible</p>
                    <p className="mt-2 text-sm text-text-secondary">
                        Impossible de récupérer les films populaires depuis TMDB. Vérifie la clé API et le backend.
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="h-11 px-4 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition"
                        >
                            Réessayer
                        </button>

                        <a
                            className="h-11 px-4 rounded-xl border border-white/10 text-text-primary hover:bg-white/10 transition inline-flex items-center"
                            href="http://localhost:3000/api/movies/popular"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Ouvrir l’API
                        </a>
                    </div>
                </div>
            ) : (
                <MovieGrid movies={filtered} />
            )}
        </div>
    );
}
