import { moviesApi } from "@/features/movies/movies.api";

export type MovieMini = {
    tmdbId: number;
    title: string;
    poster: string | null;
    release_date?: string;
    vote_average?: number;
};

const cache = new Map<number, MovieMini>();

export async function getMovieMini(tmdbId: number): Promise<MovieMini> {
    const hit = cache.get(tmdbId);
    if (hit) return hit;

    const full = await moviesApi.getById(String(tmdbId)); // backend: /api/movies/:id
    const mini: MovieMini = {
        tmdbId: full.tmdbId,
        title: full.title,
        poster: full.poster ?? null,
        release_date: full.release_date,
        vote_average: full.vote_average,
    };

    cache.set(tmdbId, mini);
    return mini;
}
