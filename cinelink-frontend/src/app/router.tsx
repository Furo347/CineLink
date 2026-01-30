import { createBrowserRouter, Navigate } from "react-router-dom";
import RequireAuth from "@/app/RequireAuth";
import AppShell from "@/app/AppShell";

import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";

import MoviesPage from "@/features/movies/pages/MoviesPage";
import MovieDetailsPage from "@/features/movies/pages/MovieDetailsPage";

export const router = createBrowserRouter([
    { path: "/", element: <Navigate to="/login" replace /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },

    {
        element: <RequireAuth />,
        children: [
            {
                path: "/app",
                element: <AppShell />,
                children: [
                    { path: "movies", element: <MoviesPage /> },
                    { path: "movies/:id", element: <MovieDetailsPage /> },
                ],
            },
        ],
    },
]);
