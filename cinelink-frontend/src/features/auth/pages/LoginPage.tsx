import { useState } from "react";
import { authApi } from "../services/auth.api";
import { authStorage } from "@/shared/services/auth.storage";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { token } = await authApi.login({ email, password });
            authStorage.setToken(token);
            alert("Connexion réussie");
        } catch {
            setError("Identifiants invalides");
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="bg-gray-900 p-6 rounded w-80"
            >
                <h1 className="text-white text-xl mb-4">Connexion</h1>

                {error && <p className="text-red-500 mb-2">{error}</p>}

                <input
                    className="w-full mb-2 p-2 rounded"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    className="w-full mb-4 p-2 rounded"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="w-full bg-red-600 text-white p-2 rounded">
                    Se connecter
                </button>
            </form>
        </div>
    );
}
