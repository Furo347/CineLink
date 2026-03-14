import { useEffect, useState } from "react";
import { toast } from "sonner";

import { followApi } from "@/features/follow/follow.api";
import { Button } from "@/components/ui/button";

export default function FollowButton({
                                         userId,
                                         initialFollowing,
                                         onChange,
                                     }: {
    userId: string;
    initialFollowing: boolean;
    onChange?: (next: boolean) => void;
}) {
    const [following, setFollowing] = useState<boolean>(initialFollowing);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFollowing(initialFollowing);
    }, [initialFollowing]);

    const toggle = async () => {
        if (!userId) {
            toast.error("Utilisateur invalide");
            return;
        }

        if (loading) return;

        setLoading(true);
        try {
            if (following) {
                await followApi.unfollow(userId);
                setFollowing(false);
                onChange?.(false);
                toast.success("Désabonné");
            } else {
                await followApi.follow(userId);
                setFollowing(true);
                onChange?.(true);
                toast.success("Abonné");
            }
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                "Action impossible pour le moment";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={toggle}
            disabled={loading}
            className={
                following
                    ? "bg-white/10 text-textPrimary hover:bg-white/15 border border-white/10"
                    : "bg-primary text-white hover:opacity-90"
            }
            variant={following ? "secondary" : "default"}
        >
            {loading ? "..." : following ? "Ne plus suivre" : "Suivre"}
        </Button>
    );
}
