import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { usersApi } from "@/features/users/users.api";
import type { UserLite } from "@/features/users/users.types";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type UserAny = UserLite & { id?: string };

function getUserId(u: UserAny): string | undefined {
    return (u as any)._id ?? u.id;
}

export default function UsersPage() {
    const nav = useNavigate();

    const [q, setQ] = useState("");
    const [items, setItems] = useState<UserAny[]>([]);
    const [loading, setLoading] = useState(false);

    const loadDefaultUsers = async () => {
        setLoading(true);
        try {
            const res = await usersApi.getAll();
            setItems(res as UserAny[]);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDefaultUsers();
    }, []);

    useEffect(() => {
        const term = q.trim();

        if (term.length === 0) {
            loadDefaultUsers();
            return;
        }

        if (term.length < 2) {
            setItems([]);
            return;
        }

        const handle = window.setTimeout(async () => {
            setLoading(true);
            try {
                const res = await usersApi.search(term);
                setItems(res as UserAny[]);
            } catch {
                toast.error("Erreur lors de la recherche");
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => window.clearTimeout(handle);
    }, [q]);

    const safeItems = useMemo(() => {
        return items.filter((u) => !!getUserId(u));
    }, [items]);

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
            ) : safeItems.length === 0 && q.trim().length >= 2 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                    <p className="text-textPrimary text-lg font-semibold">Aucun utilisateur trouvé</p>
                    <p className="mt-2 text-sm text-textSecondary">
                        Essaie un autre nom ou email.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {safeItems.map((u) => {
                        const uid = getUserId(u)!;
                        return (
                            <Card key={uid} className="bg-white/5">
                                <CardContent className="space-y-3">
                                    <div className="min-w-0">
                                        <div className="text-lg font-semibold truncate text-textPrimary">
                                            {u.name ?? u.email ?? "Utilisateur"}
                                        </div>
                                        {u.email ? (
                                            <div className="text-sm text-textSecondary truncate">
                                                {u.email}
                                            </div>
                                        ) : null}
                                    </div>

                                    <Button onClick={() => nav(`/app/users/${uid}`)}>
                                        Voir le profil
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
