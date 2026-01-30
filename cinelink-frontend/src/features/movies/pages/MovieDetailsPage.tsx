import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { moviesApi } from "../movies.api";
import type { Movie } from "../movies.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPoster } from "../movies.types";

export default function MovieDetailsPage() {
    const { id } = useParams();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        moviesApi
            .getById(id)
            .then(setMovie)
            .catch(() => toast.error("Impossible de charger le film"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-40" />
                <div className="grid gap-6 md:grid-cols-[280px_1fr]">
                    <Skeleton className="aspect-[2/3] w-full" />
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <p className="text-text-primary font-medium">Film introuvable</p>
                <Link className="text-text-secondary underline underline-offset-4" to="/app/movies">
                    Retour au catalogue
                </Link>
            </div>
        );
    }

    const poster = getPoster(movie);

    return (
        <div className="space-y-6">
            <div>
                <Link to="/app/movies" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition">
                    <ArrowLeft className="h-4 w-4" /> Retour
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-[280px_1fr]">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    {poster ? (
                        <img src={poster} alt={movie.title} className="w-full object-cover" />
                    ) : (
                        <div className="aspect-[2/3] w-full bg-gradient-to-br from-white/5 to-white/0" />
                    )}
                </div>

                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">{movie.title}</h1>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {movie.release_date && <Badge>{movie.release_date.slice(0, 4)}</Badge>}
                        {typeof movie.vote_average === "number" && <Badge>⭐ {movie.vote_average.toFixed(1)}</Badge>}
                    </div>

                    {movie.overview && (
                        <p className="mt-5 text-text-secondary leading-relaxed">
                            {movie.overview}
                        </p>
                    )}

                    <div className="mt-6 flex gap-3">
                        <Button>Ajouter aux favoris</Button>
                        <Button variant="secondary">Commenter</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
