import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { User } from "lucide-react";

import { authStorage } from "@/services/auth.storage";
import { decodeToken, getJwtEmail, getJwtName, getJwtUserId } from "@/lib/jwt";
import { usersApi } from "@/features/users/users.api";
import type { UserComment, UserFavorite, UserProfile } from "@/features/users/users.types";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import MovieRow from "@/features/users/components/MovieRow";
import { getMovieMini, type MovieMini } from "@/features/movies/movies.cache";
import {followApi} from "@/features/follow/follow.api.ts";

export default function MePage() {
    const token = authStorage.get();
    const decoded = useMemo(() => (token ? decodeToken(token) : null), [token]);

    const userId = useMemo(() => getJwtUserId(decoded), [decoded]);
    const email = useMemo(() => getJwtEmail(decoded), [decoded]);
    const nameFromJwt = useMemo(() => getJwtName(decoded), [decoded]);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [favorites, setFavorites] = useState<UserFavorite[]>([]);
    const [comments, setComments] = useState<UserComment[]>([]);
    const [loading, setLoading] = useState(true);

    const [favMinis, setFavMinis] = useState<MovieMini[]>([]);
    const [commentMovieMap, setCommentMovieMap] = useState<Map<number, MovieMini>>(new Map());
    const [enriching, setEnriching] = useState(false);

    const [followingCount, setFollowingCount] = useState<number>(0);
    const [followersCount, setFollowersCount] = useState<number | null>(null); // null = pas dispo

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
        const run = async () => {
            if (!profile) return;

            const favIds = Array.from(new Set(favorites.map((f) => f.tmdbId))).filter(
                (x) => typeof x === "number"
            );
            const commentIds = Array.from(new Set(comments.map((c) => c.movieId))).filter(
                (x) => typeof x === "number"
            );

            if (favIds.length === 0 && commentIds.length === 0) {
                setFavMinis([]);
                setCommentMovieMap(new Map());
                return;
            }

            setEnriching(true);
            try {
                const [favMovies, commentMovies] = await Promise.all([
                    Promise.all(favIds.map((id) => getMovieMini(id))),
                    Promise.all(commentIds.map((id) => getMovieMini(id))),
                ]);

                setFavMinis(favMovies);

                const map = new Map<number, MovieMini>();
                commentMovies.forEach((m) => map.set(m.tmdbId, m));
                setCommentMovieMap(map);
            } catch {
                // silent: page must remain usable even if TMDB/details fail
            } finally {
                setEnriching(false);
            }
        };

        run();
    }, [profile, favorites, comments]);

    useEffect(() => {
        const loadCounts = async () => {
            if (!profile) return;

            try {
                const following = await followApi.listFollowing();
                setFollowingCount(following.length);
            } catch {
                // silent
            }

            try {
            //    const followers = await followApi.listFollowers();
            //    setFollowersCount(followers.length);
                const followers = 0; // backend n'ayant pas encore de followers, on affiche 0 au lieu de "—"
                setFollowersCount(followers);
            } catch {
                setFollowersCount(null);
            }
        };

        loadCounts();
    }, [profile]);

    const displayName = profile?.name ?? nameFromJwt ?? "Compte";
    const displayEmail = profile?.email ?? email ?? "";

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
            {/* Header premium */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                            <User className="h-6 w-6 text-textSecondary" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-3xl font-semibold tracking-tight truncate text-textPrimary">
                                {displayName}
                            </h1>
                            {displayEmail ? (
                                <p className="mt-1 text-sm text-textSecondary truncate">{displayEmail}</p>
                            ) : null}

                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge>{favorites.length} favoris</Badge>
                                <Badge>{comments.length} commentaires</Badge>
                                {profile.createdAt ? (
                                    <Badge>Membre depuis {new Date(profile.createdAt).toLocaleDateString()}</Badge>
                                ) : null}
                                {enriching ? <Badge>Enrichissement…</Badge> : null}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/app/following"
                            className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition px-4 py-3 text-left"
                        >
                            <div className="text-xs text-textSecondary">Abonnements</div>
                            <div className="text-lg font-semibold text-textPrimary">{followingCount}</div>
                        </Link>

                        <div
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left opacity-90"
                            title={followersCount === null ? "Non disponible (backend à ajouter)" : ""}
                        >
                            <div className="text-xs text-textSecondary">Abonnés</div>
                            <div className="text-lg font-semibold text-textPrimary">
                                {followersCount === null ? "—" : followersCount}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Favoris */}
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
                        {favMinis.slice(0, 8).map((m) => {
                            const fav = favorites.find((f) => f.tmdbId === m.tmdbId);
                            return (
                                <MovieRow
                                    key={m.tmdbId}
                                    movie={m}
                                    subtitle={
                                        typeof fav?.rating === "number" ? (
                                            <>
                                                Ta note :{" "}
                                                <span className="text-textPrimary font-medium">
                          {fav.rating}/10
                        </span>
                                            </>
                                        ) : (
                                            "Non noté"
                                        )
                                    }
                                />
                            );
                        })}
                    </div>
                ) : (
                    // fallback if enrichment failed
                    <div className="grid gap-3">
                        {favorites.slice(0, 8).map((f) => (
                            <Card key={f._id} className="bg-white/5">
                                <CardContent className="space-y-2">
                                    <Link
                                        to={`/app/movies/${f.tmdbId}`}
                                        className="font-semibold hover:underline underline-offset-4"
                                    >
                                        {f.title}
                                    </Link>
                                    <div className="flex gap-2 flex-wrap">
                                        {typeof f.rating === "number" ? <Badge>Ta note : {f.rating}/10</Badge> : <Badge>Non noté</Badge>}
                                        {f.createdAt ? <Badge>{new Date(f.createdAt).toLocaleDateString()}</Badge> : null}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* Commentaires */}
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
                        {comments.slice(0, 10).map((c) => {
                            const m = commentMovieMap.get(c.movieId);

                            if (!m) {
                                return (
                                    <Card key={c._id} className="bg-white/5">
                                        <CardContent className="space-y-2">
                                            <div className="text-sm text-textSecondary">
                                                <Link to={`/app/movies/${c.movieId}`} className="hover:underline underline-offset-4">
                                                    Film #{c.movieId}
                                                </Link>
                                                {c.createdAt ? ` • ${new Date(c.createdAt).toLocaleString()}` : ""}
                                            </div>
                                            <div className="text-textPrimary">{c.content}</div>
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
