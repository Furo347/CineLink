import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Users } from "lucide-react";

import { authStorage } from "@/services/auth.storage.ts";
import { decodeToken } from "@/lib/jwt.ts";

type JwtLike = {
    name?: string;
    email?: string;
};

export default function ProfileMenu() {
    const nav = useNavigate();
    const ref = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);

    const token = authStorage.get();

    const decoded = useMemo<JwtLike | null>(() => {
        if (!token) return null;
        return decodeToken(token) as JwtLike | null;
    }, [token]);

    const displayName = decoded?.name ?? decoded?.email ?? "Compte";

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    const logout = () => {
        authStorage.clear();
        setOpen(false);
        nav("/auth/login");
    };

    const close = () => setOpen(false);

    return (
        <div ref={ref} className="relative">
            {/* ICON BUTTON */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-textPrimary"
                aria-label="Menu profil"
            >
                <User className="h-5 w-5" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-surface/95 backdrop-blur shadow-2xl z-30">
                    <div className="px-4 py-3 border-b border-white/10">
                        <div className="text-sm font-semibold text-textPrimary truncate">
                            {displayName}
                        </div>
                        {decoded?.email && (
                            <div className="text-xs text-textSecondary truncate">
                                {decoded.email}
                            </div>
                        )}
                    </div>

                    <div className="p-1">
                        <Link
                            to="/app/me"
                            onClick={close}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition text-sm text-textPrimary"
                        >
                            <User className="h-4 w-4 text-textSecondary" />
                            Mon profil
                        </Link>

                        <Link
                            to="/app/following"
                            onClick={close}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition text-sm text-textPrimary"
                        >
                            <Users className="h-4 w-4 text-textSecondary" />
                            Abonnements
                        </Link>

                        <button
                            type="button"
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition text-sm text-textPrimary text-left"
                        >
                            <LogOut className="h-4 w-4 text-textSecondary" />
                            Déconnexion
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
