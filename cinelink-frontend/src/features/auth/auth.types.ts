export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    avatar: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
}
