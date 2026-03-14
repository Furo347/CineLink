import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { User as UserIcon } from "lucide-react";

import { authStorage } from "@/services/auth.storage";
import { decodeToken, getJwtEmail, getJwtName, getJwtUserId } from "@/lib/jwt";
import { usersApi } from "@/features/users/users.api";
import type { UserComment, UserFavorite, UserProfile } from "@/features/users/users.types";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import MovieRow from "@/features/users/components/MovieRow";
import { getMovieMini, type MovieMini } from "@/features/movies/movies.cache";

export default function MePage() {
    const token = authStorage.get();
    const decoded = useMemo(() => (token ? decodeToken(token) : null), [token]);

    const userId = useMemo(() => getJwtUserId(decoded), [decoded]);
    const emailFromJwt = useMemo(() => getJwtEmail(decoded), [decoded]);
    const nameFromJwt = useMemo(() => getJwtName(decoded), [decoded]);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [favorites, setFavorites] = useState<UserFavorite[]>([]);
    const [comments, setComments] = useState<UserComment[]>([]);
    const [loading, setLoading] = useState(true);

    const [favMinis, setFavMinis] = useState<MovieMini[]>([]);
    const [commentMovieMap, setCommentMovieMap] = useState<Map<number, MovieMini>>(new Map());
    const [enriching, setEnriching] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            if (!userId) {
                setLoading(false);
                toast.error("Session invalide. Reconnecte-toi.");
                return;
            }

            setLoading(true);
            try {
                const [p, f, c] = await Promise.all([
                    usersApi.getProfile(userId),
                    usersApi.getFavorites(userId),
                    usersApi.getComments(userId),
                ]);

                setProfile(p);
                setFavorites(f);
                setComments(c);
            } catch {
                toast.error("Impossible de charger ton profil");
                setProfile(null);
                setFavorites([]);
                setComments([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [token, userId]);

    useEffect(() => {
        const enrich = async () => {
            if (!profile) return;

            const favIds = Array.from(new Set(favorites.map((f) => f.tmdbId)));
            const commentIds = Array.from(new Set(comments.map((c) => c.movieId)));

            if (favIds.length === 0 && commentIds.length === 0) {
                setFavMinis([]);
                setCommentMovieMap(new Map());
                return;
            }

            setEnriching(true);
            try {
                const [favMovies, commentMovies] = await Promise.all([
                    Promise.all(favIds.map((mid) => getMovieMini(mid))),
                    Promise.all(commentIds.map((mid) => getMovieMini(mid))),
                ]);

                setFavMinis(favMovies);

                const map = new Map<number, MovieMini>();
                commentMovies.forEach((m) => map.set(m.tmdbId, m));
                setCommentMovieMap(map);
            } catch {
                // fallback silencieux
            } finally {
                setEnriching(false);
            }
        };

        enrich();
    }, [profile, favorites, comments]);

    const displayName = profile?.name ?? nameFromJwt ?? profile?.email ?? emailFromJwt ?? "Compte";
    const displayEmail = profile?.email ?? emailFromJwt ?? "";

    if (!token) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                <p className="text-textPrimary text-lg font-semibold">Tu n’es pas connecté</p>
                <p className="mt-2 text-sm text-textSecondary">
                    Connecte-toi pour accéder à ton profil.
                </p>
                <div className="mt-6">
                    <Link
                        to="/auth/login"
                        className="h-11 px-4 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition inline-flex items-center"
                    >
                        Aller au login
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="text-textSecondary">Chargement…</div>;
    }

    if (!profile) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                <p className="text-textPrimary text-lg font-semibold">Profil indisponible</p>
                <p className="mt-2 text-sm text-textSecondary">
                    Impossible de récupérer tes informations. Essaie de te reconnecter.
                </p>
                <div className="mt-6">
                    <Link
                        to="/auth/login"
                        className="h-11 px-4 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition inline-flex items-center"
                    >
                        Se reconnecter
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                            <UserIcon className="h-6 w-6 text-textSecondary" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-3xl font-semibold tracking-tight truncate text-textPrimary">
                                {displayName}
                            </h1>

                            {displayEmail ? (
                                <p className="mt-1 text-sm text-textSecondary truncate">{displayEmail}</p>
                            ) : null}

                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge>{profile.followersCount ?? 0} abonnés</Badge>
                                <Link to="/app/following">
                                    <Badge>{profile.followingCount ?? 0} abonnements</Badge>
                                </Link>
                                <Badge>{favorites.length} favoris</Badge>
                                <Badge>{comments.length} commentaires</Badge>
                                {profile.createdAt ? (
                                    <Badge>
                                        Membre depuis {new Date(profile.createdAt).toLocaleDateString()}
                                    </Badge>
                                ) : null}
                                {enriching ? <Badge>Chargement films…</Badge> : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAVORIS */}
            <section className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                    <h2 className="text-xl font-semibold text-textPrimary">Mes favoris</h2>
                    <Link
                        to="/app/favorites"
                        className="text-sm text-textSecondary hover:text-textPrimary transition"
                    >
                        Voir tout
                    </Link>
                </div>

                {favorites.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                        <p className="text-textPrimary text-lg font-semibold">Aucun favori</p>
                        <p className="mt-2 text-sm text-textSecondary">
                            Ajoute des films depuis Catalogue ou Recherche.
                        </p>
                    </div>
                ) : favMinis.length > 0 ? (
                    <div className="grid gap-4">
                        {favMinis.map((m) => {
                            const fav = favorites.find((f) => f.tmdbId === m.tmdbId);
                            return (
                                <MovieRow
                                    key={m.tmdbId}
                                    movie={m}
                                    subtitle={
                                        typeof fav?.rating === "number"
                                            ? `Ta note : ${fav.rating}/10`
                                            : "Non noté"
                                    }
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {favorites.map((f) => (
                            <Card key={f._id} className="bg-white/5">
                                <CardContent>
                                    <div className="text-textPrimary font-medium">{f.title}</div>
                                    <div className="mt-2 text-sm text-textSecondary">
                                        {typeof f.rating === "number" ? `Ta note : ${f.rating}/10` : "Non noté"}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* COMMENTAIRES */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-textPrimary">Mes commentaires</h2>

                {comments.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                        <p className="text-textPrimary text-lg font-semibold">Aucun commentaire</p>
                        <p className="mt-2 text-sm text-textSecondary">
                            Ajoute un commentaire depuis la page d’un film.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {comments.map((c) => {
                            const m = commentMovieMap.get(c.movieId);

                            if (!m) {
                                return (
                                    <Card key={c._id} className="bg-white/5">
                                        <CardContent>
                                            <div className="text-sm text-textSecondary">
                                                Film #{c.movieId}
                                            </div>
                                            <div className="mt-2 text-textPrimary">{c.content}</div>
                                        </CardContent>
                                    </Card>
                                );
                            }

                            return (
                                <MovieRow
                                    key={c._id}
                                    movie={m}
                                    subtitle={
                                        <>
                                            <div className="line-clamp-2">{c.content}</div>
                                            {c.createdAt ? (
                                                <div className="mt-2 text-xs text-textSecondary">
                                                    {new Date(c.createdAt).toLocaleString()}
                                                </div>
                                            ) : null}
                                        </>
                                    }
                                />
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
