import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { User as UserIcon } from "lucide-react";

import { usersApi } from "../users.api";
import type { UserProfile, UserFavorite, UserComment } from "../users.types";

import FollowButton from "@/features/follow/components/FollowButton";

import { authStorage } from "@/services/auth.storage";
import { decodeToken, getJwtUserId } from "@/lib/jwt";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import MovieRow from "@/features/users/components/MovieRow";
import { getMovieMini, type MovieMini } from "@/features/movies/movies.cache";
import { getAvatarSrc } from "@/lib/avatar";

export default function UserProfilePage() {
    const params = useParams<{ id: string }>();
    const id = useMemo(() => params.id ?? "", [params.id]);

    const token = authStorage.get();
    const decoded = useMemo(() => (token ? decodeToken(token) : null), [token]);
    const myId = useMemo(() => getJwtUserId(decoded), [decoded]);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [favorites, setFavorites] = useState<UserFavorite[]>([]);
    const [comments, setComments] = useState<UserComment[]>([]);
    const [loading, setLoading] = useState(true);

    const [isFollowing, setIsFollowing] = useState(false);

    const [favMinis, setFavMinis] = useState<MovieMini[]>([]);
    const [commentMovieMap, setCommentMovieMap] = useState<Map<number, MovieMini>>(new Map());
    const [enriching, setEnriching] = useState(false);

    const profileId = useMemo(() => {
        if (!profile) return null;
        const value = (profile as UserProfile & { _id?: string }).id ?? (profile as UserProfile & { _id?: string })._id;
        return typeof value === "string" && value.trim() ? value : null;
    }, [profile]);

    const displayName = useMemo(() => {
        return profile?.name ?? profile?.email ?? "Utilisateur";
    }, [profile]);
    const avatarSrc = getAvatarSrc(profile?.avatar);

    useEffect(() => {
        const load = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const [p, f, c] = await Promise.all([
                    usersApi.getProfile(id),
                    usersApi.getFavorites(id),
                    usersApi.getComments(id),
                ]);

                setProfile(p);
                setFavorites(f);
                setComments(c);
                setIsFollowing(!!p.isFollowing);
            } catch {
                toast.error("Impossible de charger le profil");
                setProfile(null);
                setFavorites([]);
                setComments([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

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

    if (!id) {
        return <div className="text-textSecondary">Utilisateur invalide.</div>;
    }

    if (loading) {
        return <div className="text-textSecondary">Chargement…</div>;
    }

    if (!profile) {
        return <div className="text-textSecondary">Profil indisponible.</div>;
    }

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <UserIcon className="h-6 w-6 text-textSecondary" />
                            )}
                        </div>

                        <div>
                            <h1 className="text-3xl font-semibold text-textPrimary">
                                {displayName}
                            </h1>

                            {profile.email && (
                                <p className="text-sm text-textSecondary">{profile.email}</p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge>{profile.followersCount ?? 0} abonnés</Badge>
                                <Badge>{profile.followingCount ?? 0} abonnements</Badge>
                                <Badge>{favorites.length} favoris</Badge>
                                <Badge>{comments.length} commentaires</Badge>
                                {profile.createdAt && (
                                    <Badge>
                                        Membre depuis {new Date(profile.createdAt).toLocaleDateString()}
                                    </Badge>
                                )}
                                {enriching && <Badge>Chargement films…</Badge>}
                            </div>
                        </div>
                    </div>

                    {/* FOLLOW BUTTON */}
                    {myId && profileId && profileId !== myId ? (
                        <FollowButton
                            userId={profileId}
                            initialFollowing={isFollowing}
                            onChange={(next) => {
                                setIsFollowing(next);
                                setProfile((prev) =>
                                    prev
                                        ? {
                                            ...prev,
                                            followersCount: Math.max(
                                                0,
                                                (prev.followersCount ?? 0) + (next ? 1 : -1)
                                            ),
                                        }
                                        : prev
                                );
                            }}
                        />
                    ) : null}
                </div>
            </div>

            {/* FAVORIS */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-textPrimary">Favoris</h2>

                {favorites.length === 0 ? (
                    <div className="text-textSecondary">Aucun favori</div>
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
                                            ? `Note : ${fav.rating}/10`
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
                                        {typeof f.rating === "number" ? `Note : ${f.rating}/10` : "Non noté"}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* COMMENTAIRES */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-textPrimary">Commentaires</h2>

                {comments.length === 0 ? (
                    <div className="text-textSecondary">Aucun commentaire</div>
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
                                            <div className="mt-2 text-textPrimary">
                                                {c.content}
                                            </div>
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
                                            {c.createdAt && (
                                                <div className="mt-2 text-xs text-textSecondary">
                                                    {new Date(c.createdAt).toLocaleString()}
                                                </div>
                                            )}
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
