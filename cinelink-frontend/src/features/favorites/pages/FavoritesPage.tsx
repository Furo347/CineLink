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
                <div className="grid gap-4 lg:grid-cols-2">
                    {items.map((f) => (
                        <Card key={f._id} className="bg-white/5">
                            <CardContent className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="text-lg font-semibold">{f.title}</div>
                                    <div className="text-sm text-text-secondary">TMDB #{f.tmdbId}</div>

                                    <div className="mt-4 flex items-center gap-2">
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
                                </div>

                                <Button variant="secondary" size="sm" onClick={() => remove(f._id)}>
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
