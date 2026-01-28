import { api } from "@/shared/services/api";
import type { Movie } from "../types";

export const moviesApi = {
    getAll: async (): Promise<Movie[]> => {
        const response = await api.get<Movie[]>("/movies");
        return response.data;
    },

    getById: async (id: string): Promise<Movie> => {
        const response = await api.get<Movie>(`/movies/${id}`);
        return response.data;
    },
};
