import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage";
import { authApi } from "@/features/auth/auth.api";
import { authStorage } from "@/services/auth.storage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>(
        "react-router-dom"
    );

    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("@/features/auth/auth.api", () => ({
    authApi: {
        login: vi.fn(),
    },
}));

vi.mock("@/services/auth.storage", () => ({
    authStorage: {
        set: vi.fn(),
    },
}));

function renderLoginPage() {
    return render(
        <MemoryRouter>
            <LoginPage />
        </MemoryRouter>
    );
}

describe("LoginPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render login form", () => {
        renderLoginPage();

        expect(screen.getByRole("heading", { name: /connexion/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /créer un compte/i })).toHaveAttribute(
            "href",
            "/register"
        );
    });

    it("should login and redirect to movies page", async () => {
        const user = userEvent.setup();

        vi.mocked(authApi.login).mockResolvedValue({
            token: "fake-token",
        });

        renderLoginPage();

        await user.type(screen.getByLabelText(/email/i), "test@mail.com");
        await user.type(screen.getByLabelText(/mot de passe/i), "Password123!");
        await user.click(screen.getByRole("button", { name: /se connecter/i }));

        await waitFor(() => {
            expect(authApi.login).toHaveBeenCalledWith({
                email: "test@mail.com",
                password: "Password123!",
            });
        });

        expect(authStorage.set).toHaveBeenCalledWith("fake-token");
        expect(mockNavigate).toHaveBeenCalledWith("/app/movies");
    });

    it("should show validation error when email is invalid", async () => {
        const user = userEvent.setup();

        renderLoginPage();

        await user.type(screen.getByLabelText(/email/i), "invalid-email");
        await user.type(screen.getByLabelText(/mot de passe/i), "Password123!");
        await user.click(screen.getByRole("button", { name: /se connecter/i }));

        expect(await screen.findByText(/email invalide/i)).toBeInTheDocument();
        expect(authApi.login).not.toHaveBeenCalled();
    });
});
