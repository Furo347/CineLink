import { api } from "@/services/api";
import type { Favorite } from "./favorites.types";

type AddResponse = { message: string; favorite: Favorite };
type RateResponse = { message: string; favorite: Favorite };
type DeleteResponse = { message: string };

export const favoritesApi = {
    add: async (payload: { tmdbId: number; title: string }): Promise<Favorite> => {
        const { data } = await api.post<AddResponse>("/api/favorites", payload);
        return data.favorite;
    },

    list: async (): Promise<Favorite[]> => {
        const { data } = await api.get<Favorite[]>("/api/favorites");
        return data;
    },

    remove: async (id: string): Promise<void> => {
        await api.delete<DeleteResponse>(`/api/favorites/${id}`);
    },

    rate: async (id: string, rating: number): Promise<Favorite> => {
        const { data } = await api.put<RateResponse>(`/api/favorites/${id}/rate`, { rating });
        return data.favorite;
    },
};
