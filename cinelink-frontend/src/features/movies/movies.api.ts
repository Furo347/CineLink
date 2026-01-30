import { api } from "@/services/api";
import type { Movie } from "./movies.types";

export const moviesApi = {
    getPopular: async (): Promise<Movie[]> => {
        const { data } = await api.get<Movie[]>("/api/movies/popular");
        return data;
    },

    getById: async (id: string): Promise<Movie> => {
        const { data } = await api.get<Movie>(`/api/movies/${id}`);
        return data;
    },
};
