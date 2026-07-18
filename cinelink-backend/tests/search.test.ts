import request = require("supertest");
import axios from "axios";
import app from "../src/app";
import { getAuthToken } from "./helpers/auth";

jest.mock("axios", () => ({
    get: jest.fn(),
}));

const mockedAxiosGet = axios.get as jest.Mock;

describe("GET /api/search", () => {
    beforeEach(() => {
        mockedAxiosGet.mockReset();
    });

    it("should return 401 if user is not authenticated", async () => {
        const res = await request(app)
            .get("/api/search")
            .query({ q: "batman" });

        expect(res.status).toBe(401);
    });

    it("should return 400 when query is missing", async () => {
        const token = await getAuthToken();

        const res = await request(app)
            .get("/api/search")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/query/i);
    });

    it("should map TMDB results and handle missing posters", async () => {
        const token = await getAuthToken();
        mockedAxiosGet.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        id: 42,
                        title: "Batman Begins",
                        poster_path: "/batman.jpg",
                        overview: "Origin story",
                        vote_average: 7.7,
                        release_date: "2005-06-15",
                    },
                    {
                        id: 43,
                        title: "Posterless",
                        poster_path: null,
                        overview: "No poster",
                        vote_average: 6,
                        release_date: "2026-01-01",
                    },
                ],
            },
        });

        const res = await request(app)
            .get("/api/search")
            .query({ query: "batman" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toMatchObject({
            tmdbId: 42,
            title: "Batman Begins",
            overview: "Origin story",
            vote_average: 7.7,
            release_date: "2005-06-15",
        });
        expect(res.body[0].poster).toContain("/batman.jpg");
        expect(res.body[1].poster).toBeNull();
    });

    it("should return 500 when TMDB search fails", async () => {
        const token = await getAuthToken();
        mockedAxiosGet.mockRejectedValueOnce(new Error("tmdb down"));

        const res = await request(app)
            .get("/api/search")
            .query({ query: "batman" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/recherche de films/i);
    });
});
