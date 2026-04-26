import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, RefreshCw, Star } from "lucide-react";
import { toast } from "sonner";

import { feedApi } from "@/features/feed/feed.api";
import type { FeedEvent } from "@/features/feed/feed.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAvatarSrc } from "@/lib/avatar";

function getEventLabel(event: FeedEvent) {
    switch (event.type) {
        case "ADD_FAVORITE":
            return "a ajouté un film à ses favoris";
        case "RATE_MOVIE":
            return `a noté ce film ${event.payload?.rating ?? "-"} / 10`;
        case "COMMENT_MOVIE":
            return "a commenté ce film";
        default:
            return "a interagi avec un film";
    }
}

function getEventIcon(event: FeedEvent) {
    switch (event.type) {
        case "ADD_FAVORITE":
            return <Heart className="h-4 w-4 text-primary" />;
        case "RATE_MOVIE":
            return <Star className="h-4 w-4 text-primary fill-primary" />;
        case "COMMENT_MOVIE":
            return <MessageCircle className="h-4 w-4 text-primary" />;
        default:
            return <Heart className="h-4 w-4 text-primary" />;
    }
}

export default function FeedPage() {
    const [items, setItems] = useState<FeedEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const data = await feedApi.list();
            setItems(data);
        } catch {
            toast.error("Impossible de charger le fil d’actualité");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Fil d’actualité</h1>
                    <p className="mt-1 text-sm text-textSecondary">
                        Les dernières activités des utilisateurs que tu suis.
                    </p>
                </div>

                <Button variant="secondary" onClick={load}>
                    <RefreshCw className="h-4 w-4" />
                    Recharger
                </Button>
            </div>

            {loading ? (
                <div className="text-textSecondary">Chargement…</div>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                    <p className="text-textPrimary text-lg font-semibold">
                        Ton fil est vide pour le moment
                    </p>
                    <p className="mt-2 text-sm text-textSecondary">
                        Les utilisateurs que tu suis n’ont pas encore publié d’activité récente.
                        Tu peux découvrir d’autres profils pour enrichir ton fil.
                    </p>
                    <div className="mt-6">
                        <Link to="/app/users">
                            <Button>Découvrir des utilisateurs</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((event) => {
                        const actor = event.actor;
                        const actorName = actor?.name ?? "Utilisateur";
                        const actorId = actor?._id;
                        const avatarSrc = getAvatarSrc(actor?.avatar);

                        const comment = event.payload?.comment?.content;
                        const movie = event.movie;

                        if (!movie) {
                            return (
                                <Card key={event.id} className="bg-white/5">
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="h-11 w-11 rounded-2xl overflow-hidden bg-white/10 border border-white/10">
                                                {avatarSrc ? (
                                                    <img
                                                        src={avatarSrc}
                                                        alt={actorName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : null}
                                            </div>

                                            <div>
                                                <div className="text-textPrimary font-semibold">
                                                    {actorName}
                                                </div>
                                                <div className="text-sm text-textSecondary">
                                                    a réalisé une activité, mais le film associé est indisponible.
                                                </div>
                                                <div className="mt-1 text-xs text-textSecondary">
                                                    {new Date(event.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        }

                        return (
                            <Card key={event.id} className="bg-white/5 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="grid gap-0 md:grid-cols-[1fr_220px]">
                                        {/* LEFT */}
                                        <div className="p-5 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Link
                                                    to={actorId ? `/app/users/${actorId}` : "/app/users"}
                                                    className="shrink-0"
                                                >
                                                    <div className="h-11 w-11 rounded-2xl overflow-hidden bg-white/10 border border-white/10">
                                                        {avatarSrc ? (
                                                            <img
                                                                src={avatarSrc}
                                                                alt={actorName}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : null}
                                                    </div>
                                                </Link>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Link
                                                            to={actorId ? `/app/users/${actorId}` : "/app/users"}
                                                            className="font-semibold text-textPrimary hover:underline"
                                                        >
                                                            {actorName}
                                                        </Link>

                                                        <span className="text-sm text-textSecondary">
                              {getEventLabel(event)}
                            </span>
                                                    </div>

                                                    <div className="mt-1 text-xs text-textSecondary">
                                                        {new Date(event.createdAt).toLocaleString()}
                                                    </div>
                                                </div>

                                                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                    {getEventIcon(event)}
                                                </div>
                                            </div>

                                            <div>
                                                <Link
                                                    to={`/app/movies/${movie.tmdbId}`}
                                                    className="text-xl font-semibold text-textPrimary hover:underline"
                                                >
                                                    {movie.title}
                                                </Link>

                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {movie.release_date && (
                                                        <Badge>{movie.release_date.slice(0, 4)}</Badge>
                                                    )}

                                                    {typeof movie.vote_average === "number" && (
                                                        <Badge>⭐ {movie.vote_average.toFixed(1)}</Badge>
                                                    )}

                                                    {event.type === "RATE_MOVIE" &&
                                                        typeof event.payload?.rating === "number" && (
                                                            <Badge>
                                                                Note utilisateur : {event.payload.rating}/10
                                                            </Badge>
                                                        )}
                                                </div>

                                                {movie.overview && (
                                                    <p className="mt-3 text-sm text-textSecondary line-clamp-3">
                                                        {movie.overview}
                                                    </p>
                                                )}

                                                {comment && (
                                                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                                                        <div className="text-xs text-textSecondary mb-1">
                                                            Commentaire
                                                        </div>
                                                        <p className="text-sm text-textPrimary">
                                                            “{comment}”
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* RIGHT */}
                                        <Link
                                            to={`/app/movies/${movie.tmdbId}`}
                                            className="hidden md:block relative min-h-[260px] bg-white/5 overflow-hidden"
                                        >
                                            {movie.poster ? (
                                                <img
                                                    src={movie.poster}
                                                    alt={movie.title}
                                                    className="h-full w-full object-cover hover:scale-[1.03] transition"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/0" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
