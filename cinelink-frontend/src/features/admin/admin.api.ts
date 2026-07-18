import { api } from "@/services/api";

export type AdminStats = {
    users: number;
    comments: number;
    favorites: number;
    follows: number;
};

export const adminApi = {
    getStats: async (): Promise<AdminStats> => {
        const { data } = await api.get<AdminStats>("/api/admin/stats");
        return data;
    },

    removeComment: async (commentId: string): Promise<void> => {
        await api.delete(`/api/admin/comments/${commentId}`);
    },

    removeUser: async (userId: string): Promise<void> => {
        await api.delete(`/api/admin/users/${userId}`);
    },
};
