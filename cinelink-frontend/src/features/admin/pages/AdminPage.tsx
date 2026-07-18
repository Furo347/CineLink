import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldAlert, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { adminApi, type AdminStats } from "@/features/admin/admin.api";
import { usersApi } from "@/features/users/users.api";
import type { UserLite } from "@/features/users/users.types";
import { authStorage } from "@/services/auth.storage";
import { getAvatarSrc } from "@/lib/avatar";
import { getApiErrorMessage } from "@/lib/api-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function getUserId(user: UserLite) {
    return user.id ?? user._id ?? null;
}

const emptyStats: AdminStats = {
    users: 0,
    comments: 0,
    favorites: 0,
    follows: 0,
};

export default function AdminPage() {
    const isAdmin = authStorage.getRole() === "ADMIN";
    const currentUserId = authStorage.getUser()?.id;

    const [stats, setStats] = useState<AdminStats>(emptyStats);
    const [users, setUsers] = useState<UserLite[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [nextStats, nextUsers] = await Promise.all([
                adminApi.getStats(),
                usersApi.getAll(),
            ]);
            setStats(nextStats);
            setUsers(nextUsers);
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Impossible de charger l’administration"));
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        void load();
    }, [load]);

    const safeUsers = useMemo(() => users.filter((user) => !!getUserId(user)), [users]);

    const removeUser = async (user: UserLite) => {
        const userId = getUserId(user);
        if (!userId || deletingUserId) return;

        setDeletingUserId(userId);
        try {
            await adminApi.removeUser(userId);
            setUsers((prev) => prev.filter((item) => getUserId(item) !== userId));
            setStats((prev) => ({ ...prev, users: Math.max(0, prev.users - 1) }));
            toast.success("Utilisateur supprimé");
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Suppression utilisateur impossible"));
        } finally {
            setDeletingUserId(null);
        }
    };

    if (!isAdmin) {
        return (
            <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                    <h1 className="text-xl font-semibold">Accès administrateur requis</h1>
                </div>
                <p className="mt-3 text-sm text-text-secondary">
                    Cette section est réservée aux comptes disposant du rôle administrateur.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Administration</h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Supervision minimale des comptes et contenus modérés.
                    </p>
                </div>

                <Button variant="secondary" onClick={load} disabled={loading}>
                    Recharger
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
                <Card className="bg-white/5 shadow-none">
                    <CardContent className="p-4">
                        <div className="text-xs text-text-secondary">Utilisateurs</div>
                        <div className="mt-1 text-2xl font-semibold">{stats.users}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 shadow-none">
                    <CardContent className="p-4">
                        <div className="text-xs text-text-secondary">Commentaires</div>
                        <div className="mt-1 text-2xl font-semibold">{stats.comments}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 shadow-none">
                    <CardContent className="p-4">
                        <div className="text-xs text-text-secondary">Favoris</div>
                        <div className="mt-1 text-2xl font-semibold">{stats.favorites}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 shadow-none">
                    <CardContent className="p-4">
                        <div className="text-xs text-text-secondary">Relations</div>
                        <div className="mt-1 text-2xl font-semibold">{stats.follows}</div>
                    </CardContent>
                </Card>
            </div>

            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-text-secondary" />
                    <h2 className="text-xl font-semibold">Utilisateurs</h2>
                </div>

                {loading ? (
                    <div className="text-text-secondary">Chargement…</div>
                ) : safeUsers.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-text-secondary">
                        Aucun utilisateur à afficher.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {safeUsers.map((user) => {
                            const userId = getUserId(user)!;
                            const avatarSrc = getAvatarSrc(user.avatar);
                            const isCurrentUser = currentUserId === userId;
                            const isDeleting = deletingUserId === userId;

                            return (
                                <Card key={userId} className="bg-white/5 shadow-none">
                                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white/10">
                                                {avatarSrc ? (
                                                    <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                                                ) : null}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate font-medium">
                                                    {user.name ?? user.email ?? "Utilisateur"}
                                                </div>
                                                {user.email ? (
                                                    <div className="truncate text-sm text-text-secondary">{user.email}</div>
                                                ) : null}
                                            </div>
                                            {isCurrentUser ? <Badge>Vous</Badge> : null}
                                        </div>

                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled={isCurrentUser || !!deletingUserId}
                                            onClick={() => void removeUser(user)}
                                            aria-label={`Supprimer ${user.name ?? user.email ?? "utilisateur"}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            {isDeleting ? "Suppression..." : "Supprimer"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
