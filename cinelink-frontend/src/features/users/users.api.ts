import { api } from "@/services/api";
import type { UserLite, UserProfile, UserFavorite, UserComment } from "./users.types";

export const usersApi = {
    search: async (query: string): Promise<UserLite[]> => {
        const { data } = await api.get<UserLite[]>("/api/users", {
            params: { query },
        });
        return data;
    },

    getProfile: async (id: string): Promise<UserProfile> => {
        const { data } = await api.get<UserProfile>(`/api/users/${id}`);
        return data;
    },

    getFavorites: async (id: string): Promise<UserFavorite[]> => {
        const { data } = await api.get<UserFavorite[]>(`/api/users/${id}/favorites`);
        return data;
    },

    getComments: async (id: string): Promise<UserComment[]> => {
        const { data } = await api.get<UserComment[]>(`/api/users/${id}/comments`);
        return data;
    },
};
