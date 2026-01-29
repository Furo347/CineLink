import type {ReactNode} from "react";

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-full max-w-md bg-surface rounded-xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-primary text-center">
                    CineLink
                </h1>

                <div className="mt-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
