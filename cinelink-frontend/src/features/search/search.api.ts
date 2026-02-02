import { api } from "@/services/api";
import type { SearchMovie } from "./search.types";

export const searchApi = {
    search: async (q: string): Promise<SearchMovie[]> => {
        const { data } = await api.get<SearchMovie[]>("/api/search", {
            params: { query: q },
        });
        return data;
    },
};
