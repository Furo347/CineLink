import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

import { searchApi } from "@/features/search/search.api";
import type { SearchMovie } from "@/features/search/search.types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function SearchSpotlight({
                                            className = "",
                                            placeholder = "Rechercher un film…",
                                        }: {
    className?: string;
    placeholder?: string;
}) {
    const nav = useNavigate();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<SearchMovie[]>([]);
    const [active, setActive] = useState<number>(-1);

    const term = useMemo(() => q.trim(), [q]);

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    useEffect(() => {
        if (term.length < 2) {
            setItems([]);
            setLoading(false);
            setActive(-1);
            return;
        }

        setOpen(true);

        const handle = window.setTimeout(async () => {
            setLoading(true);
            try {
                const res = await searchApi.search(term);
                setItems(res.slice(0, 6));
                setActive(res.length ? 0 : -1);
            } catch {
                toast.error("Erreur lors de la recherche");
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => window.clearTimeout(handle);
    }, [term]);

    const goAll = () => {
        if (term.length < 2) return;
        setOpen(false);
        nav(`/app/search?q=${encodeURIComponent(term)}`);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) setOpen(true);

        if (e.key === "Escape") {
            setOpen(false);
            setActive(-1);
            return;
        }

        if (e.key === "Enter") {
            if (active >= 0 && items[active]) {
                setOpen(false);
                nav(`/app/movies/${items[active].tmdbId}`);
            } else {
                goAll();
            }
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!items.length) return;
            setActive((p) => (p + 1) % items.length);
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (!items.length) return;
            setActive((p) => (p - 1 + items.length) % items.length);
        }
    };

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
                ref={inputRef}
                className="pl-10"
                placeholder={placeholder}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => term.length >= 2 && setOpen(true)}
                onKeyDown={onKeyDown}
            />

            {open && (term.length >= 2) && (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-surface/95 backdrop-blur shadow-2xl">
                    <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
                        <div className="text-xs text-text-secondary">
                            {loading ? "Recherche…" : `${items.length} résultat(s)`}
                        </div>
                        <button
                            onClick={goAll}
                            className="text-xs text-text-primary hover:underline underline-offset-4 inline-flex items-center gap-1"
                        >
                            Voir tous <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-4 text-sm text-text-secondary">Chargement…</div>
                    ) : items.length === 0 ? (
                        <div className="p-4 text-sm text-text-secondary">
                            Aucun résultat pour “{term}”.
                        </div>
                    ) : (
                        <div className="max-h-[360px] overflow-auto">
                            {items.map((m, idx) => (
                                <Link
                                    key={m.tmdbId}
                                    to={`/app/movies/${m.tmdbId}`}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 transition border-b border-white/5 last:border-b-0",
                                        idx === active ? "bg-white/10" : "hover:bg-white/5"
                                    )}
                                    onMouseEnter={() => setActive(idx)}
                                >
                                    <div className="h-10 w-8 overflow-hidden rounded-lg bg-white/10 shrink-0">
                                        {m.poster ? (
                                            <img src={m.poster} alt="" className="h-full w-full object-cover" />
                                        ) : null}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-text-primary truncate">{m.title}</div>
                                        <div className="text-xs text-text-secondary">
                                            {m.release_date?.slice(0, 4)} • ⭐ {m.vote_average.toFixed(1)}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
