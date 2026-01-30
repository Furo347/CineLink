import { api } from "@/services/api";

export type AuthResponse = { token: string };

export type RegisterPayload = { username: string; email: string; password: string };
export type LoginPayload = { email: string; password: string };

export const authApi = {
    register: async (payload: RegisterPayload) => {
        const { data } = await api.post<AuthResponse>("/api/auth/register", payload);
        return data;
    },
    login: async (payload: LoginPayload) => {
        const { data } = await api.post<AuthResponse>("/api/auth/login", payload);
        return data;
    },
};
