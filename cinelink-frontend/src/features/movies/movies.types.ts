export interface Credit {
    name: string;
    character: string;
    profile_path?: string | null;
}

export interface Video {
    type: string;
    key: string;
}

export interface Movie {
    tmdbId: number;
    title: string;

    poster: string | null;
    overview: string;

    release_date: string;
    vote_average: number;

    // details only
    backdrop?: string | null;
    runtime?: number;
    genres?: string[];
    credits?: Credit[];
    videos?: Video[];
}

export function getMovieId(m: Movie): string {
    return String(m.tmdbId);
}

export function getPoster(m: Movie): string | null {
    return m.poster;
}
