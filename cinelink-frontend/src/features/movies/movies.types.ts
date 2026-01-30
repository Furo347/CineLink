export type MovieId = string;

export interface Movie {
    _id?: string;
    id?: string;
    title: string;
    description?: string;
    releaseDate?: string;
    posterUrl?: string;
    poster?: string;
    backdropUrl?: string;
    genres?: string[];
    rating?: number;
}

export function getMovieId(m: Movie): MovieId {
    return (m.id ?? m._id ?? "") as MovieId;
}

export function getPoster(m: Movie): string | undefined {
    return m.posterUrl ?? m.poster;
}
