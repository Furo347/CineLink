import axios from "axios";
import { authStorage } from "@/services/auth.storage";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = authStorage.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
