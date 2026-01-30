export interface Favorite {
    _id: string;
    tmdbId: number;
    title: string;

    poster?: string | null;
    overview?: string;
    vote_average?: number;

    rating?: number;
}
