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
    username: z.string().min(2, "Pseudo trop court"),
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "6 caractères minimum"),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
    const nav = useNavigate();
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { username: "", email: "", password: "" },
    });

    const onSubmit = async (values: FormValues) => {
        try {
            const { token } = await authApi.register(values);
            authStorage.set(token);
            toast.success("Compte créé. Bienvenue sur CineLink !");
            nav("/app/movies");
        } catch {
            toast.error("Impossible de créer le compte (email déjà utilisé ?)");
        }
    };

    const { errors, isSubmitting } = form.formState;

    return (
        <AuthShell>
            <h1 className="text-2xl font-semibold">Créer un compte</h1>
            <p className="mt-1 text-sm text-text-secondary">
                Rejoins CineLink et commence à construire ta collection.
            </p>

            <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-2">
                    <Label htmlFor="username">Pseudo</Label>
                    <Input id="username" placeholder="ex: flopo" {...form.register("username")} />
                    {errors.username && <p className="text-sm text-primary">{errors.username.message}</p>}
                </div>

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
                    {isSubmitting ? "Création..." : "Créer mon compte"}
                </Button>

                <p className="text-sm text-text-secondary text-center">
                    Déjà un compte ?{" "}
                    <Link className="text-text-primary underline underline-offset-4 hover:opacity-90" to="/login">
                        Se connecter
                    </Link>
                </p>
            </form>
        </AuthShell>
    );
}
