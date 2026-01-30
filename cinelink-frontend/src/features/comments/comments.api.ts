import { api } from "@/services/api";
import type { Comment } from "./comments.types";

type AddResponse = { message: string; comment: Comment };

export const commentsApi = {
    listByMovie: async (movieId: number): Promise<Comment[]> => {
        const { data } = await api.get<Comment[]>(`/api/comments/${movieId}`);
        return data;
    },

    add: async (payload: { movieId: number; content: string }): Promise<Comment> => {
        const { data } = await api.post<AddResponse>("/api/comments", payload);
        return data.comment;
    },

    remove: async (id: string): Promise<void> => {
        await api.delete(`/api/comments/${id}`);
    },
};
