import { api } from "@/services/api";
import type { Favorite } from "./favorites.types";

export const favoritesApi = {
    add: async (payload: { tmdbId: number; title: string }): Promise<Favorite> => {
        const { data } = await api.post<Favorite>("/api/favorites", payload);
        return data;
    },

    list: async (): Promise<Favorite[]> => {
        const { data } = await api.get<Favorite[]>("/api/favorites");
        return data;
    },

    remove: async (id: string): Promise<void> => {
        await api.delete(`/api/favorites/${id}`);
    },

    rate: async (id: string, rating: number): Promise<Favorite> => {
        const { data } = await api.put<Favorite>(`/api/favorites/${id}/rate`, { rating });
        return data;
    },
};
