import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { searchApi } from "@/features/search/search.api";
import type { SearchMovie } from "@/features/search/search.types";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function ResultsSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <Skeleton className="aspect-[2/3] w-full" />
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function SearchPage() {
    const [params, setParams] = useSearchParams();
    const initial = params.get("q") ?? "";

    const [q, setQ] = useState(initial);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<SearchMovie[]>([]);
    const lastQueryRef = useRef<string>("");

    const trimmed = useMemo(() => q.trim(), [q]);

    useEffect(() => {
        const next = new URLSearchParams(params);
        if (trimmed) next.set("q", trimmed);
        else next.delete("q");
        setParams(next, { replace: true });
    }, [trimmed]);

    useEffect(() => {
        if (trimmed.length < 2) {
            setItems([]);
            setLoading(false);
            return;
        }

        const handle = window.setTimeout(async () => {
            if (lastQueryRef.current === trimmed) return;
            lastQueryRef.current = trimmed;

            setLoading(true);
            try {
                const res = await searchApi.search(trimmed);
                setItems(res);
            } catch {
                toast.error("Erreur lors de la recherche");
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => window.clearTimeout(handle);
    }, [trimmed]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-semibold tracking-tight">Recherche</h1>
                <p className="text-sm text-text-secondary">
                    Trouve un film, ouvre la fiche, ajoute en favoris, commente.
                </p>

                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                        className="pl-10"
                        placeholder="Rechercher un film… (min 2 caractères)"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
            </div>

            {trimmed.length < 2 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                    <p className="text-text-primary text-lg font-semibold">Commence ta recherche</p>
                    <p className="mt-2 text-sm text-text-secondary">
                        Tape au moins 2 caractères pour voir les résultats.
                    </p>
                </div>
            ) : loading ? (
                <ResultsSkeleton />
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                    <p className="text-text-primary text-lg font-semibold">Aucun résultat</p>
                    <p className="mt-2 text-sm text-text-secondary">
                        Essaie un autre mot-clé.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((m) => (
                        <Link
                            key={m.tmdbId}
                            to={`/app/movies/${m.tmdbId}`}
                            className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                        >
                            <div className="relative aspect-[2/3] w-full overflow-hidden">
                                {m.poster ? (
                                    <img
                                        src={m.poster}
                                        alt={m.title}
                                        className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-300"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/0" />
                                )}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                            </div>

                            <div className="p-4">
                                <h3 className="text-base font-semibold leading-snug text-text-primary line-clamp-2">
                                    {m.title}
                                </h3>

                                <div className="mt-2 flex flex-wrap gap-2">
                                    <Badge>{m.release_date?.slice(0, 4)}</Badge>
                                    <Badge>⭐ {m.vote_average.toFixed(1)}</Badge>
                                </div>

                                {m.overview && (
                                    <p className="mt-3 text-sm text-text-secondary line-clamp-2">
                                        {m.overview}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
