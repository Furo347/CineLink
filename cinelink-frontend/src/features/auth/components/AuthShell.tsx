import type {PropsWithChildren} from "react";
import { Card, CardContent } from "@/components/ui/card.tsx";

export default function AuthShell({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-background text-text-primary relative overflow-hidden">
            {/* glow */}
            <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 right-20 h-[520px] w-[520px] rounded-full bg-white/10 blur-[140px]" />

            <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-md">
                    <div className="mb-2 flex items-center justify-center gap-1">
                        <img
                            src="/logo.svg"
                            alt="CineLink Logo"
                            className="h-10 w-10"
                        />
                        <div className="text-2xl font-bold tracking-tight">CineLink</div>
                    </div>
                    <div className="mb-3 text-center">
                        <div className="text-sm text-text-secondary">Découvre • Partage • Follow</div>
                    </div>

                    <Card>
                        <CardContent>{children}</CardContent>
                    </Card>

                    <p className="mt-6 text-center text-xs text-text-secondary">
                        © {new Date().getFullYear()} CineLink • Projet produit
                    </p>
                </div>
            </div>
        </div>
    );
}
