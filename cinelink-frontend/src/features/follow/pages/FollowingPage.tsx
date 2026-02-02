import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users } from "lucide-react";
import type { FollowRelation } from "../follow.types";
import { followApi } from "../follow.api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FollowingPage() {
    const [items, setItems] = useState<FollowRelation[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const data = await followApi.list();
            setItems(data);
        } catch {
            toast.error("Impossible de charger tes abonnements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const unfollow = async (userId: string) => {
        try {
            await followApi.unfollow(userId);
            setItems((prev) => prev.filter((r) => r.following._id !== userId));
            toast.success("Utilisateur désuivi");
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Action impossible");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Abonnements</h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Les utilisateurs que tu suis. Ils alimentent ton feed.
                    </p>
                </div>

                <Button variant="secondary" onClick={load}>
                    Recharger
                </Button>
            </div>

            {loading ? (
                <div className="text-text-secondary">Chargement…</div>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                    <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-text-secondary" />
                    </div>
                    <p className="text-text-primary text-lg font-semibold">Tu ne suis personne</p>
                    <p className="mt-2 text-sm text-text-secondary">
                        Tu pourras suivre des gens depuis leurs profils (V2) ou depuis le feed (prochain sprint).
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((r) => (
                        <Card key={r._id} className="bg-white/5">
                            <CardContent className="space-y-3">
                                <div className="min-w-0">
                                    <div className="text-lg font-semibold truncate">{r.following.name}</div>
                                    {r.following.email ? (
                                        <div className="text-sm text-text-secondary truncate">{r.following.email}</div>
                                    ) : null}

                                    {r.createdAt ? (
                                        <div className="mt-2 text-xs text-text-secondary">
                                            Abonné depuis {new Date(r.createdAt).toLocaleDateString()}
                                        </div>
                                    ) : null}
                                </div>

                                <Button variant="secondary" onClick={() => unfollow(r.following._id)}>
                                    Ne plus suivre
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
