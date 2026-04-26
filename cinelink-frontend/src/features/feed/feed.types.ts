export type FeedEventType = "ADD_FAVORITE" | "RATE_MOVIE" | "COMMENT_MOVIE";

export interface FeedActor {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface FeedMovie {
    tmdbId: number;
    title: string;
    poster: string | null;
    overview: string;
    vote_average: number;
    release_date: string;
}

export interface FeedEvent {
    id: string;
    type: FeedEventType;
    actor: FeedActor;
    targetUser: string | null;
    targetMovie: number;
    movie: FeedMovie;
    payload:
        | null
        | {
        rating?: number;
        comment?: {
            _id: string;
            user: string;
            movieId: number;
            content: string;
            createdAt: string;
        };
    };
    createdAt: string;
}
