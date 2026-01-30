export interface Comment {
    _id: string;
    movieId: string;
    content: string;
    user?: {
        _id: string;
        username?: string;
    };
    createdAt?: string;
}
