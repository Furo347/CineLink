import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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

export default function LoginPage() {
    const nav = useNavigate();
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (values: FormValues) => {
        try {
            const { token } = await authApi.login(values);
            authStorage.set(token);
            toast.success("Connexion réussie.");
            nav("/app/movies");
        } catch {
            toast.error("Identifiants invalides.");
        }
    };

    const { errors, isSubmitting } = form.formState;

    return (
        <AuthShell>
            <h1 className="text-2xl font-semibold">Connexion</h1>
            <p className="mt-1 text-sm text-text-secondary">Accède à ton catalogue et ton feed.</p>

            <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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

                <Button className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Connexion..." : "Se connecter"}
                </Button>

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
