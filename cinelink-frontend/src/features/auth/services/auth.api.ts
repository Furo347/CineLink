import { api } from "@/shared/services/api";
import type { LoginPayload, RegisterPayload, AuthResponse } from "../types";

export const authApi = {
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/api/auth/login", payload);
        return response.data;
    },

    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>(
            "/api/auth/register",
            payload
        );
        return response.data;
    },
};
