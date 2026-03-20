import { api } from "@/services/api";
import type { AuthResponse, LoginPayload, RegisterPayload } from "./auth.types";

export const authApi = {
    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        const { data } = await api.post<AuthResponse>("/api/auth/register", payload);
        return data;
    },

    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const { data } = await api.post<AuthResponse>("/api/auth/login", payload);
        return data;
    },
};
