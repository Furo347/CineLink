import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CommentsSection from "@/features/comments/components/CommentsSection";
import { adminApi } from "@/features/admin/admin.api";
import { commentsApi } from "@/features/comments/comments.api";
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
        removeComment: vi.fn(),
    },
}));

vi.mock("@/features/comments/comments.api", () => ({
    commentsApi: {
        listByMovie: vi.fn(),
        add: vi.fn(),
        remove: vi.fn(),
    },
}));

vi.mock("@/services/auth.storage", () => ({
    authStorage: {
        get: vi.fn(),
        getRole: vi.fn(),
    },
}));

const comment = {
    _id: "comment1",
    movieId: 42,
    content: "Très bon film",
    createdAt: "2026-01-01T10:00:00.000Z",
    user: {
        _id: "author1",
        name: "Alice",
        email: "alice@mail.com",
    },
};

describe("CommentsSection admin actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(authStorage.get).mockReturnValue(null);
        vi.mocked(authStorage.getRole).mockReturnValue("USER");
        vi.mocked(commentsApi.listByMovie).mockResolvedValue([comment]);
    });

    it("does not show admin delete action to a regular user", async () => {
        render(<CommentsSection movieId={42} />);

        expect(await screen.findByText("Très bon film")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /supprimer le commentaire en admin/i })).not.toBeInTheDocument();
    });

    it("shows admin delete action to an admin", async () => {
        vi.mocked(authStorage.getRole).mockReturnValue("ADMIN");

        render(<CommentsSection movieId={42} />);

        expect(await screen.findByText("Très bon film")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /supprimer le commentaire en admin/i })).toBeInTheDocument();
    });

    it("removes the comment after a successful admin deletion", async () => {
        const user = userEvent.setup();
        vi.mocked(authStorage.getRole).mockReturnValue("ADMIN");
        vi.mocked(adminApi.removeComment).mockResolvedValue();

        render(<CommentsSection movieId={42} />);

        await user.click(await screen.findByRole("button", { name: /supprimer le commentaire en admin/i }));

        await waitFor(() => {
            expect(adminApi.removeComment).toHaveBeenCalledWith("comment1");
        });
        expect(toast.success).toHaveBeenCalledWith("Commentaire supprimé par l’administration");
        expect(screen.queryByText("Très bon film")).not.toBeInTheDocument();
    });

    it("shows an API error when admin deletion fails", async () => {
        const user = userEvent.setup();
        vi.mocked(authStorage.getRole).mockReturnValue("ADMIN");
        vi.mocked(adminApi.removeComment).mockRejectedValue({
            response: { data: { message: "Accès administrateur requis" } },
        });

        render(<CommentsSection movieId={42} />);

        await user.click(await screen.findByRole("button", { name: /supprimer le commentaire en admin/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Accès administrateur requis");
        });
        expect(screen.getByText("Très bon film")).toBeInTheDocument();
    });
});
