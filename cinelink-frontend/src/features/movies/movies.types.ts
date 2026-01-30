export interface Movie {
    tmdbId: number;
    title: string;
    poster: string | null;
    overview: string;
    vote_average: number;
    release_date: string;
}

export function getMovieId(m: Movie): string {
    return String(m.tmdbId);
}

export function getPoster(m: Movie): string | null {
    return m.poster;
}
