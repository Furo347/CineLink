import { api } from "@/services/api";

export const adminApi = {
    removeComment: async (commentId: string): Promise<void> => {
        await api.delete(`/api/admin/comments/${commentId}`);
    },
};
