import { api } from "@/services/api";
import type { Comment } from "./comments.types";

export const commentsApi = {
    listByMovie: async (movieId: string): Promise<Comment[]> => {
        const { data } = await api.get<Comment[]>(`/api/comments/${movieId}`);
        return data;
    },

    add: async (payload: { movieId: string; content: string }): Promise<Comment> => {
        const { data } = await api.post<Comment>("/api/comments", payload);
        return data;
    },

    remove: async (id: string): Promise<void> => {
        await api.delete(`/api/comments/${id}`);
    },
};
