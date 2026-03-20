import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { User as UserIcon, Users } from "lucide-react";

import { followApi } from "../follow.api";
import type { FollowRelation } from "../follow.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAvatarSrc } from "@/lib/avatar";

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
                    <p className="mt-1 text-sm text-textSecondary">
                        Les utilisateurs que tu suis.
                    </p>
                </div>

                <Button variant="secondary" onClick={load}>
                    Recharger
                </Button>
            </div>

            {loading ? (
                <div className="text-textSecondary">Chargement…</div>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                    <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-textSecondary" />
                    </div>
                    <p className="text-textPrimary text-lg font-semibold">Tu ne suis personne</p>
                    <p className="mt-2 text-sm text-textSecondary">
                        Découvre des utilisateurs depuis l’onglet Découvrir.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((r) => {
                        const avatarSrc = getAvatarSrc(r.following.avatar);
                        return (
                            <Card key={r._id} className="bg-white/5">
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white/10 shrink-0">
                                            {avatarSrc ? (
                                                <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <UserIcon className="h-5 w-5 text-textSecondary" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="text-lg font-semibold truncate text-textPrimary">
                                                {r.following.name ?? r.following.email ?? "Utilisateur"}
                                            </div>
                                            {r.following.email ? (
                                                <div className="text-sm text-textSecondary truncate">
                                                    {r.following.email}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link to={`/app/users/${r.following._id}`} className="flex-1">
                                            <Button variant="secondary" className="w-full">
                                                Voir le profil
                                            </Button>
                                        </Link>

                                        <Button variant="secondary" onClick={() => unfollow(r.following._id)}>
                                            Ne plus suivre
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
