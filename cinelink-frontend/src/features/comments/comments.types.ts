export interface CommentUser {
    _id: string;
    name: string;
    email?: string;
}

export interface Comment {
    _id: string;
    movieId: number;
    content: string;
    createdAt: string;
    user: CommentUser | string;
}
