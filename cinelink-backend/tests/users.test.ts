import request from "supertest";
import app from "../src/app";
import Favorite from "../src/models/Favorite";

// Mock axios pour éviter les appels réseau TMDB
jest.mock("axios", () => ({
    get: jest.fn(async () => ({
        data: {
            title: "Mock Movie",
            poster_path: "/mock.jpg",
            overview: "Mock overview",
            vote_average: 8.2,
        },
    })),
}));

async function getAuthToken() {
    await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "testuser@mail.com",
        password: "password123",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
        email: "testuser@mail.com",
        password: "password123",
    });

    return loginRes.body.token as string;
}

async function getFirstUserId(token: string) {
    const res = await request(app)
        .get("/api/users/all")
        .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    return res.body[0].id as string;
}

describe("Users routes", () => {
    it("GET /api/users/all should return 401 without token", async () => {
        const res = await request(app).get("/api/users/all");
        expect(res.status).toBe(401);
    });

    it("GET /api/users/all should return array and respect limit", async () => {
        const token = await getAuthToken();

        const res = await request(app)
            .get("/api/users/all")
            .query({ limit: 1 })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeLessThanOrEqual(1);

        const user = res.body[0];
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("email");
        expect(JSON.stringify(user)).not.toMatch(/password/i);
    });

    it("GET /api/users?query= should return [] when query is empty", async () => {
        const token = await getAuthToken();

        const res = await request(app)
            .get("/api/users")
            .query({ query: "" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("GET /api/users?query= should return array when query matches", async () => {
        const token = await getAuthToken();

        const res = await request(app)
            .get("/api/users")
            .query({ query: "test" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("GET /api/users/:id should return 400 for invalid id", async () => {
        const token = await getAuthToken();

        const res = await request(app)
            .get("/api/users/not-an-objectid")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/invalide/i);
    });

    it("GET /api/users/:id should return 404 for non-existing id", async () => {
        const token = await getAuthToken();

        // ObjectId valide mais inexistant
        const res = await request(app)
            .get("/api/users/507f1f77bcf86cd799439011")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
    });

    it("GET /api/users/:id should return profile with counters", async () => {
        const token = await getAuthToken();
        const userId = await getFirstUserId(token);

        const res = await request(app)
            .get(`/api/users/${userId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("name");
        expect(res.body).toHaveProperty("email");
        expect(res.body).toHaveProperty("followersCount");
        expect(res.body).toHaveProperty("followingCount");
        expect(res.body).toHaveProperty("isFollowing");
    });

    it("GET /api/users/:id/comments should return 200 and array (possibly empty)", async () => {
        const token = await getAuthToken();
        const userId = await getFirstUserId(token);

        const res = await request(app)
            .get(`/api/users/${userId}/comments`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("GET /api/users/:id/favorites should return [] when no favorites", async () => {
        const token = await getAuthToken();
        const userId = await getFirstUserId(token);

        const res = await request(app)
            .get(`/api/users/${userId}/favorites`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("GET /api/users/:id/favorites should return enriched favorites (axios mocked)", async () => {
        const token = await getAuthToken();
        const userId = await getFirstUserId(token);

        // Insert un favori directement en DB (rapide et stable)
        await Favorite.create({
            user: userId,
            tmdbId: 123,
            title: "Fallback title",
            rating: 4,
        });

        const res = await request(app)
            .get(`/api/users/${userId}/favorites`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);

        const fav = res.body[0];
        expect(fav).toHaveProperty("tmdbId", 123);
        expect(fav).toHaveProperty("title", "Mock Movie"); // vient du mock axios
        expect(fav).toHaveProperty("poster");
        expect(fav).toHaveProperty("overview");
    });
});
