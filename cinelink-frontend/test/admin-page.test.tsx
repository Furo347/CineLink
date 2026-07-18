import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import AppShell from "@/app/AppShell";
import AdminPage from "@/features/admin/pages/AdminPage";
import { adminApi } from "@/features/admin/admin.api";
import { usersApi } from "@/features/users/users.api";
import { authStorage } from "@/services/auth.storage";
import { toast } from "sonner";

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("@/features/admin/admin.api", () => ({
    adminApi: {
        getStats: vi.fn(),
        removeUser: vi.fn(),
    },
}));

vi.mock("@/features/users/users.api", () => ({
    usersApi: {
        getAll: vi.fn(),
    },
}));

vi.mock("@/services/auth.storage", () => ({
    authStorage: {
        getRole: vi.fn(),
        getUser: vi.fn(),
    },
}));

vi.mock("@/features/users/components/ProfileMenu.tsx", () => ({
    default: () => <button>Profil</button>,
}));

describe("AdminPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(authStorage.getRole).mockReturnValue("ADMIN");
        vi.mocked(authStorage.getUser).mockReturnValue({
            id: "admin1",
            email: "admin@mail.com",
            name: "Admin",
            avatar: "avatar1",
            role: "ADMIN",
        });
        vi.mocked(adminApi.getStats).mockResolvedValue({
            users: 2,
            comments: 4,
            favorites: 6,
            follows: 8,
        });
        vi.mocked(usersApi.getAll).mockResolvedValue([
            { id: "admin1", name: "Admin", email: "admin@mail.com", avatar: "avatar1" },
            { id: "user1", name: "Alice", email: "alice@mail.com", avatar: "avatar2" },
        ]);
    });

    it("blocks non-admin users in the UI", () => {
        vi.mocked(authStorage.getRole).mockReturnValue("USER");

        render(<AdminPage />);

        expect(screen.getByText(/accès administrateur requis/i)).toBeInTheDocument();
        expect(adminApi.getStats).not.toHaveBeenCalled();
    });

    it("renders admin stats and users", async () => {
        render(<AdminPage />);

        expect(await screen.findByRole("heading", { name: /administration/i })).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("6")).toBeInTheDocument();
        expect(screen.getByText("8")).toBeInTheDocument();
        expect(await screen.findByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Vous")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /supprimer admin/i })).toBeDisabled();
    });

    it("removes a user from the list after successful deletion", async () => {
        const user = userEvent.setup();
        vi.mocked(adminApi.removeUser).mockResolvedValue();

        render(<AdminPage />);

        await user.click(await screen.findByRole("button", { name: /supprimer alice/i }));

        await waitFor(() => {
            expect(adminApi.removeUser).toHaveBeenCalledWith("user1");
        });
        expect(toast.success).toHaveBeenCalledWith("Utilisateur supprimé");
        expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    });

    it("shows an error when user deletion fails", async () => {
        const user = userEvent.setup();
        vi.mocked(adminApi.removeUser).mockRejectedValue({
            response: { data: { message: "Utilisateur introuvable" } },
        });

        render(<AdminPage />);

        await user.click(await screen.findByRole("button", { name: /supprimer alice/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Utilisateur introuvable");
        });
        expect(screen.getByText("Alice")).toBeInTheDocument();
    });
});

describe("AppShell admin navigation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("hides admin navigation for regular users", () => {
        vi.mocked(authStorage.getRole).mockReturnValue("USER");

        render(
            <MemoryRouter>
                <AppShell />
            </MemoryRouter>
        );

        expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
    });

    it("shows admin navigation for admins", () => {
        vi.mocked(authStorage.getRole).mockReturnValue("ADMIN");

        render(
            <MemoryRouter>
                <AppShell />
            </MemoryRouter>
        );

        expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute("href", "/app/admin");
    });
});
