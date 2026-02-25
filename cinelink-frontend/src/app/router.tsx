import { createBrowserRouter, Navigate } from "react-router-dom";
import RequireAuth from "@/app/RequireAuth";
import AppShell from "@/app/AppShell";

import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";

import MoviesPage from "@/features/movies/pages/MoviesPage";
import MovieDetailsPage from "@/features/movies/pages/MovieDetailsPage";

import FavoritesPage from "@/features/favorites/pages/FavoritesPage";
import SearchPage from "@/features/search/pages/SearchPage";

import FollowingPage from "@/features/follow/pages/FollowingPage";
import UsersPage from "@/features/users/pages/UsersPage.tsx";
import UserProfilePage from "@/features/users/pages/UserProfilePage.tsx";
import MePage from "@/features/users/pages/MePage.tsx";



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
                    { path: "favorites", element: <FavoritesPage /> },
                    { path: "search", element: <SearchPage /> },
                    { path: "following", element: <FollowingPage /> },
                    { path: "users", element: <UsersPage /> },
                    { path: "users/:id", element: <UserProfilePage /> },
                    { path: "me", element: <MePage /> },
                ],
            },
        ],
    },
]);
