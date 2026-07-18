const TOKEN_KEY = "cinelink_token";
const USER_KEY = "cinelink_user";

export type StoredUser = {
    id: string;
    email: string;
    name: string;
    avatar: string;
    role: "USER" | "ADMIN";
};

export const authStorage = {
    get: () => localStorage.getItem(TOKEN_KEY),
    set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
    setUser: (user: StoredUser) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
    getUser: (): StoredUser | null => {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;

        try {
            const parsed = JSON.parse(raw) as StoredUser;
            return parsed.role === "ADMIN" || parsed.role === "USER" ? parsed : null;
        } catch {
            return null;
        }
    },
    getRole: () => authStorage.getUser()?.role ?? "USER",
    clear: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};
