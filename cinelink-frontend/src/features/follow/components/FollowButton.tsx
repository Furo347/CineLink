import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, UserMinus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { followApi } from "../follow.api";

export default function FollowButton({
                                         userId,
                                         initialFollowing,
                                         onChange,
                                     }: {
    userId: string;
    initialFollowing: boolean;
    onChange?: (following: boolean) => void;
}) {
    const [following, setFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);

    const toggle = async () => {
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
            const msg = e?.response?.data?.message;
            toast.error(msg || "Action impossible");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant={following ? "secondary" : "default"} onClick={toggle} disabled={loading}>
            {following ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {following ? "Ne plus suivre" : "Suivre"}
        </Button>
    );
}
