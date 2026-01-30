import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { authStorage } from "@/services/auth.storage";

export default function AppShell() {
    return (
        <div className="min-h-screen bg-background text-text-primary">
            <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="font-semibold">CineLink</div>
                <Button
                    variant="secondary"
                    onClick={() => {
                        authStorage.clear();
                        window.location.href = "/login";
                    }}
                >
                    Déconnexion
                </Button>
            </div>

            <main className="p-6">
                <Outlet />
            </main>
        </div>
    );
}
