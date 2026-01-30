import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { moviesApi } from "../movies.api";
import type { Movie } from "../movies.types";
import MovieGrid from "../components/MovieGrid";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        moviesApi
            .getAll()
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
                    <Input
                        className="pl-10"
                        placeholder="Rechercher un film…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <MoviesSkeleton />
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                    <p className="text-text-primary font-medium">Aucun film trouvé</p>
                    <p className="mt-1 text-sm text-text-secondary">
                        Essaie un autre titre.
                    </p>
                </div>
            ) : (
                <MovieGrid movies={filtered} />
            )}
        </div>
    );
}
