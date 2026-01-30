import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Star } from "lucide-react";

import { favoritesApi } from "../favorites.api";
import type { Favorite } from "../favorites.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function FavoritesPage() {
    const [items, setItems] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const data = await favoritesApi.list();
            setItems(data);
        } catch {
            toast.error("Impossible de charger les favoris");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const remove = async (id: string) => {
        try {
            await favoritesApi.remove(id);
            setItems((prev) => prev.filter((f) => f._id !== id));
            toast.success("Favori supprimé");
        } catch {
            toast.error("Suppression impossible");
        }
    };

    const rate = async (id: string, rating: number) => {
        try {
            const updated = await favoritesApi.rate(id, rating);
            setItems((prev) => prev.map((f) => (f._id === id ? updated : f)));
            toast.success("Note enregistrée");
        } catch {
            toast.error("Impossible d’enregistrer la note");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">Favoris</h1>
                <p className="mt-1 text-sm text-text-secondary">
                    Tes films enregistrés. Note-les pour enrichir ton feed.
                </p>
            </div>

            {loading ? (
                <div className="text-text-secondary">Chargement…</div>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                    <p className="text-text-primary text-lg font-semibold">Aucun favori</p>
                    <p className="mt-2 text-sm text-text-secondary">
                        Ajoute un film depuis le catalogue.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((f) => (
                        <Card key={f._id} className="overflow-hidden bg-white/5">
                            <div className="relative aspect-[16/9] w-full overflow-hidden">
                                {f.poster ? (
                                    <img
                                        src={f.poster}
                                        alt={f.title}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/0" />
                                )}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                            </div>

                            <CardContent className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-lg font-semibold leading-snug line-clamp-2">{f.title}</div>
                                        <div className="text-xs text-text-secondary">TMDB #{f.tmdbId}</div>
                                    </div>

                                    <Button variant="secondary" size="sm" onClick={() => remove(f._id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {typeof f.vote_average === "number" && (
                                    <div className="text-sm text-text-secondary">
                                        Note TMDB : <span className="text-text-primary font-medium">{f.vote_average.toFixed(1)}</span>
                                    </div>
                                )}

                                {f.overview && (
                                    <p className="text-sm text-text-secondary line-clamp-3">{f.overview}</p>
                                )}

                                <div className="pt-2 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <button
                                                key={n}
                                                onClick={() => rate(f._id, n)}
                                                className="p-1 rounded-lg hover:bg-white/10 transition"
                                                aria-label={`Noter ${n}`}
                                            >
                                                <Star
                                                    className={`h-5 w-5 ${
                                                        (f.rating ?? 0) >= n ? "text-primary" : "text-text-secondary"
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    <div className="text-xs text-text-secondary">
                                        Ta note : <span className="text-text-primary font-medium">{f.rating ?? "-"}</span>/5
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
