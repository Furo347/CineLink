import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

import AuthShell from "@/features/auth/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AvatarPicker, { AVATARS } from "@/features/auth/components/AvatarPicker";
import { authApi } from "@/features/auth/auth.api";
import { authStorage } from "@/services/auth.storage";

export default function RegisterPage() {
    const nav = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [avatar, setAvatar] = useState(AVATARS[0].key);
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Le nom est obligatoire");
            return;
        }

        if (!email.trim() || !password.trim()) {
            toast.error("Email et mot de passe requis");
            return;
        }

        setLoading(true);
        try {
            const { token } = await authApi.register({
                name: name.trim(),
                email: email.trim(),
                password,
                avatar,
            });

            authStorage.set(token);
            toast.success("Compte créé");
            nav("/app/me");
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Inscription impossible");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-textPrimary">Créer un compte</h1>
                    <p className="mt-1 text-sm text-textSecondary">
                        Rejoins CineLink et personnalise ton profil.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-textSecondary">Nom</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Florentin"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-textSecondary">Email</label>
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="toi@exemple.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-textSecondary">Mot de passe</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm text-textSecondary">Choisis ton avatar</label>
                        <AvatarPicker value={avatar} onChange={setAvatar} />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Création..." : "Créer mon compte"}
                    </Button>
                </form>

                <p className="text-sm text-textSecondary">
                    Déjà un compte ?{" "}
                    <Link to="/auth/login" className="text-textPrimary hover:underline">
                        Se connecter
                    </Link>
                </p>
            </div>
        </AuthShell>
    );
}
