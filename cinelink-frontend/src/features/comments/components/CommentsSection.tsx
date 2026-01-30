import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { commentsApi } from "../comments.api";
import type { Comment } from "../comments.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CommentsSection({ movieId }: { movieId: number }) {
    const [items, setItems] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await commentsApi.listByMovie(movieId);
            setItems(data);
        } catch {
            toast.error("Impossible de charger les commentaires");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [movieId]);

    const send = async () => {
        const text = content.trim();
        if (!text) return;

        setSending(true);
        try {
            const created = await commentsApi.add({ movieId, content: text });
            setItems((prev) => [created, ...prev]);
            setContent("");
            toast.success("Commentaire publié");
        } catch {
            toast.error("Impossible de publier");
        } finally {
            setSending(false);
        }
    };

    const remove = async (id: string) => {
        try {
            await commentsApi.remove(id);
            setItems((prev) => prev.filter((c) => c._id !== id));
            toast.success("Commentaire supprimé");
        } catch (e: any) {
            const msg = e?.response?.data?.message;
            if (msg?.includes("Non autorisé")) toast.error("Tu ne peux supprimer que tes commentaires.");
            else toast.error("Suppression impossible");
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold">Commentaires</h2>
                <p className="text-sm text-text-secondary">Partage ton avis.</p>
            </div>

            <Card className="bg-white/5">
                <CardContent className="flex gap-3">
                    <Input
                        placeholder="Écrire un commentaire…"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <Button onClick={send} disabled={sending}>
                        {sending ? "Envoi..." : "Publier"}
                    </Button>
                </CardContent>
            </Card>

            {loading ? (
                <div className="text-text-secondary">Chargement…</div>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                    <p className="text-text-primary font-medium">Aucun commentaire</p>
                    <p className="mt-1 text-sm text-text-secondary">Sois le premier à réagir.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((c) => {
                        const author = typeof c.user === "string" ? "Utilisateur" : (c.user?.name ?? "Utilisateur");

                        return (
                            <Card key={c._id} className="bg-white/5">
                                <CardContent className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="text-sm text-text-secondary">
                                            {author} • {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                                        </div>

                                        <div className="mt-2 text-text-primary">{c.content}</div>
                                    </div>

                                    <Button variant="secondary" size="sm" onClick={() => remove(c._id)}>
                                        <Trash2 className="h-4 w-4" />
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
