import { api } from "@/services/api";
import type { FollowRelation } from "./follow.types";

type MessageResponse = { message: string };

export const followApi = {
    list: async (): Promise<FollowRelation[]> => {
        const { data } = await api.get<FollowRelation[]>("/api/follow");
        return data;
    },

    follow: async (userId: string): Promise<void> => {
        await api.post<MessageResponse>(`/api/follow/${userId}`);
    },

    unfollow: async (userId: string): Promise<void> => {
        await api.delete<MessageResponse>(`/api/follow/${userId}`);
    },

    listFollowing: async (): Promise<FollowRelation[]> => {
        const { data } = await api.get<FollowRelation[]>("/api/follow");
        return data;
    },
};
