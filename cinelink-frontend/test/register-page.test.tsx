import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import RegisterPage from "@/features/auth/pages/RegisterPage";
import { authApi } from "@/features/auth/auth.api";
import { authStorage } from "@/services/auth.storage";
import { toast } from "sonner";

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
        register: vi.fn(),
    },
}));

vi.mock("@/services/auth.storage", () => ({
    authStorage: {
        set: vi.fn(),
        setUser: vi.fn(),
    },
}));

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

function renderRegisterPage() {
    return render(
        <MemoryRouter>
            <RegisterPage />
        </MemoryRouter>
    );
}

describe("RegisterPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render register form", () => {
        renderRegisterPage();

        expect(
            screen.getByRole("heading", { name: /créer un compte/i })
        ).toBeInTheDocument();

        expect(screen.getByPlaceholderText("Jean")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("toi@exemple.com")).toBeInTheDocument();
        expect(screen.getByText(/8 caractères minimum/i)).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /créer mon compte/i })
        ).toBeInTheDocument();

        expect(screen.getByRole("link", { name: /se connecter/i })).toHaveAttribute(
            "href",
            "/login"
        );
    });

    it("should register user and redirect to profile page", async () => {
        const user = userEvent.setup();

        vi.mocked(authApi.register).mockResolvedValue({
            token: "fake-register-token",
        });

        renderRegisterPage();

        await user.type(screen.getByPlaceholderText("Jean"), "Florentin");
        await user.type(screen.getByPlaceholderText("toi@exemple.com"), "florentin@mail.com");
        await user.type(screen.getByPlaceholderText("••••••••"), "Password123!");

        await user.click(screen.getByAltText("avatar3"));

        await user.click(screen.getByRole("button", { name: /créer mon compte/i }));

        await waitFor(() => {
            expect(authApi.register).toHaveBeenCalledWith({
                name: "Florentin",
                email: "florentin@mail.com",
                password: "Password123!",
                avatar: "avatar3",
            });
        });

        expect(authStorage.set).toHaveBeenCalledWith("fake-register-token");
        expect(toast.success).toHaveBeenCalledWith("Compte créé");
        expect(mockNavigate).toHaveBeenCalledWith("/app/me");
    });

    it("should show an error when name is missing", async () => {
        const user = userEvent.setup();

        renderRegisterPage();

        await user.type(screen.getByPlaceholderText("toi@exemple.com"), "florentin@mail.com");
        await user.type(screen.getByPlaceholderText("••••••••"), "Password123!");

        await user.click(screen.getByRole("button", { name: /créer mon compte/i }));

        expect(toast.error).toHaveBeenCalledWith("Le nom est obligatoire");
        expect(authApi.register).not.toHaveBeenCalled();
    });

    it("should show an error when email or password is missing", async () => {
        const user = userEvent.setup();

        renderRegisterPage();

        await user.type(screen.getByPlaceholderText("Jean"), "Florentin");

        await user.click(screen.getByRole("button", { name: /créer mon compte/i }));

        expect(toast.error).toHaveBeenCalledWith("Email et mot de passe requis");
        expect(authApi.register).not.toHaveBeenCalled();
    });

    it("should show loading state, prevent double submit and display delayed wait message", async () => {
        const user = userEvent.setup();
        const register = deferred<{ token: string }>();
        vi.mocked(authApi.register).mockReturnValue(register.promise);

        renderRegisterPage();

        await user.type(screen.getByPlaceholderText("Jean"), "Florentin");
        await user.type(screen.getByPlaceholderText("toi@exemple.com"), "florentin@mail.com");
        await user.type(screen.getByPlaceholderText("••••••••"), "Password123!");

        await user.click(screen.getByRole("button", { name: /créer mon compte/i }));

        const loadingButton = await screen.findByRole("button", { name: /création du compte/i });
        expect(loadingButton).toBeDisabled();
        expect(loadingButton).toHaveAttribute("aria-busy", "true");

        await user.click(loadingButton);
        expect(authApi.register).toHaveBeenCalledTimes(1);

        expect(
            await screen.findByText(/le premier chargement peut prendre quelques instants/i, {}, { timeout: 1500 })
        ).toBeInTheDocument();

        register.resolve({ token: "fake-register-token" });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/app/me");
        });
    });

    it("should restore normal submit state after a registration error", async () => {
        const user = userEvent.setup();
        vi.mocked(authApi.register).mockRejectedValue({
            response: { data: { message: "Email déjà utilisé" } },
        });

        renderRegisterPage();

        await user.type(screen.getByPlaceholderText("Jean"), "Florentin");
        await user.type(screen.getByPlaceholderText("toi@exemple.com"), "florentin@mail.com");
        await user.type(screen.getByPlaceholderText("••••••••"), "Password123!");
        await user.click(screen.getByRole("button", { name: /créer mon compte/i }));

        expect(await screen.findByRole("button", { name: /créer mon compte/i })).toBeEnabled();
        expect(toast.error).toHaveBeenCalledWith("Email déjà utilisé");
        expect(screen.queryByRole("button", { name: /création du compte/i })).not.toBeInTheDocument();
    });
});
