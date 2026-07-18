import request = require("supertest");
import axios from "axios";
import app from "../src/app";
import { getAuthToken } from "./helpers/auth";

jest.mock("axios", () => ({
    get: jest.fn(),
}));

const mockedAxiosGet = axios.get as jest.Mock;

describe("Movies routes", () => {
    beforeEach(() => {
        mockedAxiosGet.mockReset();
    });

    it("returns 401 on popular movies without token", async () => {
        const res = await request(app).get("/api/movies/popular");

        expect(res.status).toBe(401);
    });

    it("maps popular movies from TMDB", async () => {
        const token = await getAuthToken();
        mockedAxiosGet.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        id: 42,
                        title: "Inception",
                        poster_path: "/poster.jpg",
                        overview: "Dreams",
                        vote_average: 8.8,
                        release_date: "2010-07-16",
                    },
                    {
                        id: 43,
                        title: "No Poster",
                        poster_path: null,
                        overview: "No poster movie",
                        vote_average: 6,
                        release_date: "2026-01-01",
                    },
                ],
            },
        });

        const res = await request(app)
            .get("/api/movies/popular")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toMatchObject({
            tmdbId: 42,
            title: "Inception",
            overview: "Dreams",
            vote_average: 8.8,
        });
        expect(res.body[0].poster).toContain("/poster.jpg");
        expect(res.body[1].poster).toBeNull();
    });

    it("returns 500 when TMDB popular movies fail", async () => {
        const token = await getAuthToken();
        mockedAxiosGet.mockRejectedValueOnce(new Error("tmdb down"));

        const res = await request(app)
            .get("/api/movies/popular")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/films populaires/i);
    });

    it("maps movie details from TMDB", async () => {
        const token = await getAuthToken();
        mockedAxiosGet.mockResolvedValueOnce({
            data: {
                id: 42,
                title: "Inception",
                overview: "Dreams",
                poster_path: "/poster.jpg",
                backdrop_path: "/backdrop.jpg",
                release_date: "2010-07-16",
                runtime: 148,
                genres: [{ name: "Science-fiction" }],
                vote_average: 8.8,
                credits: {
                    cast: [
                        { name: "Actor 1", character: "Role 1", profile_path: "/actor.jpg" },
                        { name: "Actor 2", character: "Role 2", profile_path: null },
                    ],
                },
                videos: {
                    results: [
                        { type: "Teaser", key: "teaser" },
                        { type: "Trailer", key: "trailer" },
                    ],
                },
            },
        });

        const res = await request(app)
            .get("/api/movies/42")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            tmdbId: 42,
            title: "Inception",
            genres: ["Science-fiction"],
            runtime: 148,
        });
        expect(res.body.poster).toContain("/poster.jpg");
        expect(res.body.backdrop).toContain("/backdrop.jpg");
        expect(res.body.credits).toHaveLength(2);
        expect(res.body.videos).toEqual([{ type: "Trailer", key: "trailer" }]);
    });

    it("returns 500 when TMDB details fail", async () => {
        const token = await getAuthToken();
        mockedAxiosGet.mockRejectedValueOnce(new Error("tmdb down"));

        const res = await request(app)
            .get("/api/movies/42")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/récupération du film/i);
    });
});
