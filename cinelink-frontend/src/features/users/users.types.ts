export interface UserLite {
    _id: string;
    name: string;
    email?: string;
}

export interface UserProfile extends UserLite {
    createdAt?: string;
}

export interface UserFavorite {
    _id: string;
    tmdbId: number;
    title: string;
    rating?: number;
    createdAt?: string;
}

export interface UserComment {
    _id: string;
    movieId: number;
    content: string;
    createdAt?: string;
}
