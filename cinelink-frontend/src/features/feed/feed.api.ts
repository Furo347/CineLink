import { api } from "@/services/api";
import type { FeedEvent } from "./feed.types";

export const feedApi = {
    list: async (): Promise<FeedEvent[]> => {
        const { data } = await api.get<FeedEvent[]>("/api/feed");
        return data;
    },
};
