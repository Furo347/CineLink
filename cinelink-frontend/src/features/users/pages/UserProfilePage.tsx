import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { usersApi } from "../users.api";
import type { UserProfile, UserFavorite, UserComment } from "../users.types";
import FollowButton from "@/features/follow/components/FollowButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UserProfilePage() {
    const params = useParams<{ id: string }>();
    const id = useMemo(() => params.id, [params.id]);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [favorites, setFavorites] = useState<UserFavorite[]>([]);
    const [comments, setComments] = useState<UserComment[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (!id) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                <p className="text-textPrimary text-lg font-semibold">Utilisateur invalide</p>
                <p className="mt-2 text-sm text-textSecondary">
                    L’identifiant de l’utilisateur est manquant dans l’URL.
                </p>
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
                    L’utilisateur n’existe pas ou le backend a refusé la requête.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-3xl font-semibold tracking-tight truncate">{profile.name}</h1>
                    {profile.email ? (
                        <p className="text-sm text-textSecondary truncate">{profile.email}</p>
                    ) : null}
                    {profile.createdAt ? (
                        <div className="mt-2">
                            <Badge>Inscrit le {new Date(profile.createdAt).toLocaleDateString()}</Badge>
                        </div>
                    ) : null}
                </div>

                <FollowButton userId={profile._id} initialFollowing={false} />
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Favoris</h2>

                {favorites.length === 0 ? (
                    <div className="text-textSecondary">Aucun favori</div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {favorites.map((f) => (
                            <Card key={f._id} className="bg-white/5">
                                <CardContent className="space-y-2">
                                    <Link
                                        to={`/app/movies/${f.tmdbId}`}
                                        className="font-semibold hover:underline underline-offset-4"
                                    >
                                        {f.title}
                                    </Link>

                                    <div className="flex flex-wrap gap-2">
                                        {typeof f.rating === "number" ? (
                                            <Badge>Note : {f.rating}/10</Badge>
                                        ) : (
                                            <Badge>Non noté</Badge>
                                        )}
                                        {f.createdAt ? <Badge>{new Date(f.createdAt).toLocaleDateString()}</Badge> : null}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Commentaires</h2>

                {comments.length === 0 ? (
                    <div className="text-textSecondary">Aucun commentaire</div>
                ) : (
                    <div className="space-y-3">
                        {comments.map((c) => (
                            <Card key={c._id} className="bg-white/5">
                                <CardContent className="space-y-2">
                                    <div className="text-sm text-textSecondary">
                                        <Link
                                            to={`/app/movies/${c.movieId}`}
                                            className="hover:underline underline-offset-4"
                                        >
                                            Voir le film
                                        </Link>
                                        {c.createdAt ? ` • ${new Date(c.createdAt).toLocaleString()}` : ""}
                                    </div>
                                    <p className="text-textPrimary">{c.content}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
