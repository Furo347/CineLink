import { Outlet, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import ProfileMenu from "@/features/users/components/ProfileMenu.tsx";

export default function AppShell() {
    return (
        <div className="min-h-screen bg-background text-text-primary">
            <header className="sticky top-0 z-10 border-b border-white/10 bg-background/80 backdrop-blur">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img
                            src="/logo.svg"
                            alt="CineLink Logo"
                            className="h-10 w-10"
                        />
                        <div>
                            <div className="font-semibold leading-none">CineLink</div>
                            <div className="text-xs text-text-secondary">Re-découvrez le cinéma !</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <NavLink
                            to="/app/movies"
                            className={({ isActive }) =>
                                cn(
                                    "text-sm px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition",
                                    isActive ? "bg-white/10 text-text-primary" : "text-text-secondary"
                                )
                            }
                        >
                            Catalogue
                        </NavLink>

                        <NavLink
                            to="/app/search"
                            className={({ isActive }) =>
                                cn(
                                    "text-sm px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition",
                                    isActive ? "bg-white/10 text-text-primary" : "text-text-secondary"
                                )
                            }
                        >
                            Recherche
                        </NavLink>

                        <NavLink
                            to="/app/favorites"
                            className={({ isActive }) =>
                                cn(
                                    "text-sm px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition",
                                    isActive ? "bg-white/10 text-text-primary" : "text-text-secondary"
                                )
                            }
                        >
                            Favoris
                        </NavLink>

                        <NavLink
                            to="/app/users"
                            className={({ isActive }) =>
                                cn(
                                    "text-sm px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition",
                                    isActive ? "bg-white/10 text-text-primary" : "text-text-secondary"
                                )
                            }
                        >
                            Suivre
                        </NavLink>

                        <ProfileMenu />
                    </div>
                </div>
            </header>

            <main className="p-6">
                <Outlet />
            </main>
        </div>
    );
}
