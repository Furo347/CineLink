import { api } from "@/services/api";
import type { Movie } from "./movies.types";

export const moviesApi = {
    getAll: async (): Promise<Movie[]> => {
        const { data } = await api.get<Movie[]>("/api/movies");
        return data;
    },

    getById: async (id: string): Promise<Movie> => {
        const { data } = await api.get<Movie>(`/api/movies/${id}`);
        return data;
    },
};
