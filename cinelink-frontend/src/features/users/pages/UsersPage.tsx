import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { usersApi } from "@/features/users/users.api";
import type { UserLite } from "@/features/users/users.types";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
    const nav = useNavigate();

    const [q, setQ] = useState("");
    const [items, setItems] = useState<UserLite[]>([]);
    const [loading, setLoading] = useState(false);

    // Default suggestions on first load (avoid empty page)
    useEffect(() => {
        const loadDefault = async () => {
            setLoading(true);
            try {
                const res = await usersApi.search("a");
                setItems(res);
            } catch {
                // silent: don't spam user on first load
            } finally {
                setLoading(false);
            }
        };
        loadDefault();
    }, []);

    // Search with debounce (min 2 chars)
    useEffect(() => {
        const term = q.trim();
        if (term.length === 0) return; // keep default suggestions
        if (term.length < 2) {
            setItems([]);
            return;
        }

        const handle = window.setTimeout(async () => {
            setLoading(true);
            try {
                const res = await usersApi.search(term);
                setItems(res);
            } catch {
                toast.error("Erreur lors de la recherche");
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => window.clearTimeout(handle);
    }, [q]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">Découvrir</h1>
                <p className="mt-1 text-sm text-textSecondary">
                    Recherche des utilisateurs, consulte leur profil et suis-les.
                </p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
                <Input
                    className="pl-10"
                    placeholder="Rechercher un utilisateur… (min 2 caractères)"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-textSecondary">Chargement…</div>
            ) : items.length === 0 && q.trim().length >= 2 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                    <p className="text-textPrimary text-lg font-semibold">Aucun utilisateur trouvé</p>
                    <p className="mt-2 text-sm text-textSecondary">
                        Essaie un autre nom ou email.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((u) => (
                        <Card key={u._id} className="bg-white/5">
                            <CardContent className="space-y-3">
                                <div className="min-w-0">
                                    <div className="text-lg font-semibold truncate text-textPrimary">{u.name}</div>
                                    {u.email ? (
                                        <div className="text-sm text-textSecondary truncate">{u.email}</div>
                                    ) : null}
                                </div>

                                <Button onClick={() => nav(`/app/users/${u._id}`)}>
                                    Voir le profil
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
