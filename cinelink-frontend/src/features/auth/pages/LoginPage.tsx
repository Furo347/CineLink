import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import AuthShell from "@/features/auth/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/features/auth/auth.api";
import { authStorage } from "@/services/auth.storage";

const schema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(1, "Mot de passe requis"),
});

type FormValues = z.infer<typeof schema>;
const WAIT_MESSAGE_DELAY_MS = 500;
const WAIT_MESSAGE = "Le premier chargement peut prendre quelques instants lorsque les services redémarrent.";

export default function LoginPage() {
    const nav = useNavigate();
    const [showWaitMessage, setShowWaitMessage] = useState(false);
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (values: FormValues) => {
        setShowWaitMessage(false);
        try {
            const { token, user } = await authApi.login(values);
            authStorage.set(token);
            if (user) authStorage.setUser(user);
            toast.success("Connexion réussie.");
            nav("/app/movies");
        } catch {
            toast.error("Identifiants invalides.");
        } finally {
            setShowWaitMessage(false);
        }
    };

    const { errors, isSubmitting } = form.formState;

    useEffect(() => {
        if (!isSubmitting) {
            return;
        }

        const timer = window.setTimeout(() => setShowWaitMessage(true), WAIT_MESSAGE_DELAY_MS);
        return () => window.clearTimeout(timer);
    }, [isSubmitting]);

    return (
        <AuthShell>
            <h1 className="text-2xl font-semibold">Connexion</h1>
            <p className="mt-1 text-sm text-text-secondary">Accède à ton catalogue et ton feed.</p>

            <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)} aria-busy={isSubmitting}>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="toi@exemple.com" {...form.register("email")} />
                    {errors.email && <p className="text-sm text-primary">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
                    {errors.password && <p className="text-sm text-primary">{errors.password.message}</p>}
                </div>

                <Button className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Connexion en cours…
                        </>
                    ) : (
                        "Se connecter"
                    )}
                </Button>

                <p className="min-h-5 text-center text-xs text-text-secondary" aria-live="polite">
                    {showWaitMessage ? WAIT_MESSAGE : ""}
                </p>

                <p className="text-sm text-text-secondary text-center">
                    Pas encore de compte ?{" "}
                    <Link className="text-text-primary underline underline-offset-4 hover:opacity-90" to="/register">
                        Créer un compte
                    </Link>
                </p>
            </form>
        </AuthShell>
    );
}
