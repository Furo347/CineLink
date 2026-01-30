import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { moviesApi } from "../movies.api";
import type { Movie } from "../movies.types";
import { Skeleton } from "@/components/ui/skeleton";
import { getPoster } from "../movies.types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionTitle, SectionHint } from "@/components/ui/section";
import { favoritesApi } from "@/features/favorites/favorites.api";
import CommentsSection from "@/features/comments/components/CommentsSection";


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
    getPoster(movie);
    const trailerKey =
        movie.videos?.find((v) => v.type === "Trailer")?.key ??
        movie.videos?.[0]?.key;

    const runtimeLabel =
        typeof movie.runtime === "number"
            ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
            : null;


    return (
        <div className="space-y-8">
            <div>
                <Link
                    to="/app/movies"
                    className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition"
                >
                    <ArrowLeft className="h-4 w-4" /> Retour
                </Link>
            </div>

            {/* HERO */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                {movie.backdrop ? (
                    <img
                        src={movie.backdrop}
                        alt=""
                        className="h-[260px] w-full object-cover"
                    />
                ) : (
                    <div className="h-[260px] w-full bg-gradient-to-br from-white/10 to-white/0" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight">{movie.title}</h1>
                            <div className="mt-2 flex flex-wrap gap-2 text-sm text-text-secondary">
                                <span>{movie.release_date?.slice(0, 4)}</span>
                                {runtimeLabel && <span>• {runtimeLabel}</span>}
                                <span>• ⭐ {movie.vote_average.toFixed(1)}</span>
                                {movie.genres?.length ? <span>• {movie.genres.join(" • ")}</span> : null}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={async () => {
                                    try {
                                        await favoritesApi.add({
                                            tmdbId: movie.tmdbId,
                                            title: movie.title,
                                            poster: movie.poster,
                                            overview: movie.overview,
                                            vote_average: movie.vote_average,
                                        });
                                        toast.success("Ajouté aux favoris");
                                    } catch {
                                        toast.error("Impossible d’ajouter aux favoris");
                                    }
                                }}
                            >
                                Ajouter aux favoris
                            </Button>
                            <Button variant="secondary">Commenter</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* DESCRIPTION */}
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
                <div className="space-y-6">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <SectionTitle>Synopsis</SectionTitle>
                        <p className="mt-3 text-text-secondary leading-relaxed">{movie.overview}</p>
                    </div>

                    {/* CAST */}
                    {movie.credits?.length ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <SectionTitle>Casting</SectionTitle>
                            <SectionHint className="mt-1">Principaux acteurs</SectionHint>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {movie.credits.slice(0, 8).map((c) => (
                                    <div
                                        key={`${c.name}-${c.character}`}
                                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                                    >
                                        <div className="h-10 w-10 overflow-hidden rounded-xl bg-white/10 shrink-0">
                                            {c.profile_path ? (
                                                <img src={c.profile_path} alt={c.name} className="h-full w-full object-cover" />
                                            ) : null}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-text-primary truncate">{c.name}</div>
                                            <div className="text-xs text-text-secondary truncate">{c.character}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* COMMENTS */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <CommentsSection movieId={String(movie.tmdbId)} />
                    </div>
                </div>

                {/* TRAILER */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <SectionTitle>Trailer</SectionTitle>
                        <SectionHint className="mt-1">Lecture YouTube intégrée</SectionHint>

                        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
                            {trailerKey ? (
                                <iframe
                                    className="aspect-video w-full"
                                    src={`https://www.youtube.com/embed/${trailerKey}`}
                                    title="Trailer"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="aspect-video w-full flex items-center justify-center text-text-secondary">
                                    Aucun trailer disponible
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
