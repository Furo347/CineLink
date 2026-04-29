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
            return `a donné une note de ${event.payload?.rating ?? "-"} / 10`;
        case "COMMENT_MOVIE":
            return "a partagé un commentaire";
        default:
            return "a publié une activité";
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

function formatDate(date: string) {
    return new Date(date).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
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
        <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Fil d’actualité
                    </h1>
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
                        const movie = event.movie;
                        const comment = event.payload?.comment?.content;

                        return (
                            <Card key={event.id} className="bg-white/5 border-white/10">
                                <CardContent className="p-5">
                                    {/* Header social */}
                                    <div className="flex items-start gap-4">
                                        <Link
                                            to={actorId ? `/app/users/${actorId}` : "/app/users"}
                                            className="shrink-0"
                                        >
                                            <div className="h-13 w-13 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
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
                                                {formatDate(event.createdAt)}
                                            </div>
                                        </div>

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                                            {getEventIcon(event)}
                                        </div>
                                    </div>

                                    {/* Commentaire utilisateur */}
                                    {comment && (
                                        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-sm leading-relaxed text-textPrimary">
                                                “{comment}”
                                            </p>
                                        </div>
                                    )}

                                    {/* Film comme contenu attaché */}
                                    {movie ? (
                                        <Link
                                            to={`/app/movies/${movie.tmdbId}`}
                                            className="mt-5 flex gap-4 rounded-2xl border border-white/10 bg-background/40 p-3 transition hover:bg-white/10"
                                        >
                                            <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-white/10">
                                                {movie.poster ? (
                                                    <img
                                                        src={movie.poster}
                                                        alt={movie.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/0" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="truncate text-base font-semibold text-textPrimary">
                                                        {movie.title}
                                                    </h2>

                                                    {movie.release_date && (
                                                        <Badge>{movie.release_date.slice(0, 4)}</Badge>
                                                    )}
                                                </div>

                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {typeof movie.vote_average === "number" && (
                                                        <Badge>⭐ TMDB {movie.vote_average.toFixed(1)}</Badge>
                                                    )}

                                                    {event.type === "RATE_MOVIE" &&
                                                        typeof event.payload?.rating === "number" && (
                                                            <Badge>
                                                                Note de {actorName} : {event.payload.rating}/10
                                                            </Badge>
                                                        )}
                                                </div>

                                                {movie.overview && (
                                                    <p className="mt-3 line-clamp-2 text-sm text-textSecondary">
                                                        {movie.overview}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-textSecondary">
                                            Aucun film associé à cette activité.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
