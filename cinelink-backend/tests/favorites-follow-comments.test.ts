import request = require("supertest");
import app from "../src/app";
import Favorite from "../src/models/Favorite";
import Comment from "../src/models/Comment";
import User from "../src/models/User";
import { getAuthToken, loginUser, registerUser } from "./helpers/auth";

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

async function createUserAndToken(email: string, name = "Test User") {
    await registerUser({ email, name });
    const loginRes = await loginUser({ email });
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User was not created");
    }

    return { token: loginRes.body.token as string, user };
}

describe("Favorites authorization and validation", () => {
    it("returns 401 when favorites are requested without token", async () => {
        const res = await request(app).get("/api/favorites");

        expect(res.status).toBe(401);
    });

    it("returns 400 when tmdbId is missing", async () => {
        const token = await getAuthToken();

        const res = await request(app)
            .post("/api/favorites")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "No id" });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/tmdbId/i);
    });

    it("adds a favorite and prevents duplicates", async () => {
        const token = await getAuthToken();

        const first = await request(app)
            .post("/api/favorites")
            .set("Authorization", `Bearer ${token}`)
            .send({ tmdbId: 42, title: "Inception" });

        expect(first.status).toBe(201);
        expect(first.body.favorite).toHaveProperty("tmdbId", 42);

        const duplicate = await request(app)
            .post("/api/favorites")
            .set("Authorization", `Bearer ${token}`)
            .send({ tmdbId: 42, title: "Inception" });

        expect(duplicate.status).toBe(400);
        expect(duplicate.body.message).toMatch(/déjà/i);
    });

    it("lists enriched favorites", async () => {
        const { token, user } = await createUserAndToken("fav-owner@mail.com");

        await Favorite.create({
            user: user._id,
            tmdbId: 42,
            title: "Fallback",
            rating: 7,
        });

        const res = await request(app)
            .get("/api/favorites")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({
            tmdbId: 42,
            title: "Mock Movie",
            overview: "Mock overview",
            vote_average: 8.2,
            rating: 7,
        });
        expect(res.body[0].poster).toContain("/mock.jpg");
    });

    it("validates ratings and returns 404 for another user's favorite", async () => {
        const { token: ownerToken, user: owner } = await createUserAndToken("owner@mail.com");
        const { token: otherToken } = await createUserAndToken("other@mail.com", "Other User");

        const favorite = await Favorite.create({
            user: owner._id,
            tmdbId: 42,
            title: "Inception",
        });

        const invalidRating = await request(app)
            .put(`/api/favorites/${favorite._id}/rate`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({ rating: 11 });

        expect(invalidRating.status).toBe(400);

        const forbiddenByLookup = await request(app)
            .put(`/api/favorites/${favorite._id}/rate`)
            .set("Authorization", `Bearer ${otherToken}`)
            .send({ rating: 8 });

        expect(forbiddenByLookup.status).toBe(404);
    });

    it("rates and deletes an owned favorite", async () => {
        const { token, user } = await createUserAndToken("rate-owner@mail.com");
        const favorite = await Favorite.create({
            user: user._id,
            tmdbId: 43,
            title: "Interstellar",
        });

        const rate = await request(app)
            .put(`/api/favorites/${favorite._id}/rate`)
            .set("Authorization", `Bearer ${token}`)
            .send({ rating: 9 });

        expect(rate.status).toBe(200);
        expect(rate.body.favorite.rating).toBe(9);

        const remove = await request(app)
            .delete(`/api/favorites/${favorite._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(remove.status).toBe(200);
        expect(await Favorite.findById(favorite._id)).toBeNull();
    });
});

describe("Follow rules", () => {
    it("returns 401 without token", async () => {
        const res = await request(app).get("/api/follow");

        expect(res.status).toBe(401);
    });

    it("prevents following yourself and duplicate follows", async () => {
        const { token, user } = await createUserAndToken("self@mail.com");

        const self = await request(app)
            .post(`/api/follow/${user._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(self.status).toBe(400);
        expect(self.body.message).toMatch(/soi-même/i);

        const target = await createUserAndToken("target@mail.com", "Target User");
        const first = await request(app)
            .post(`/api/follow/${target.user._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(first.status).toBe(201);

        const duplicate = await request(app)
            .post(`/api/follow/${target.user._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(duplicate.status).toBe(400);
        expect(duplicate.body.message).toMatch(/déjà/i);
    });

    it("lists following users and returns 404 when unfollowing a missing relation", async () => {
        const { token } = await createUserAndToken("follower@mail.com");
        const target = await createUserAndToken("followed@mail.com", "Followed User");

        await request(app)
            .post(`/api/follow/${target.user._id}`)
            .set("Authorization", `Bearer ${token}`);

        const list = await request(app)
            .get("/api/follow")
            .set("Authorization", `Bearer ${token}`);

        expect(list.status).toBe(200);
        expect(list.body).toHaveLength(1);
        expect(list.body[0].following.name).toBe("Followed User");

        const unfollow = await request(app)
            .delete(`/api/follow/${target.user._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(unfollow.status).toBe(200);

        const missing = await request(app)
            .delete(`/api/follow/${target.user._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(missing.status).toBe(404);
    });
});

describe("Comment validation and ownership", () => {
    it("returns 401 when posting without token", async () => {
        const res = await request(app)
            .post("/api/comments")
            .send({ movieId: 42, content: "Nice" });

        expect(res.status).toBe(401);
    });

    it("returns 400 when content is blank", async () => {
        const token = await getAuthToken();

        const res = await request(app)
            .post("/api/comments")
            .set("Authorization", `Bearer ${token}`)
            .send({ movieId: 42, content: "   " });

        expect(res.status).toBe(400);
    });

    it("creates, lists and deletes an owned comment", async () => {
        const { token } = await createUserAndToken("commenter@mail.com");

        const create = await request(app)
            .post("/api/comments")
            .set("Authorization", `Bearer ${token}`)
            .send({ movieId: 42, content: "Très bon film" });

        expect(create.status).toBe(201);
        const commentId = create.body.comment._id as string;

        const list = await request(app).get("/api/comments/42");

        expect(list.status).toBe(200);
        expect(list.body[0].content).toBe("Très bon film");

        const remove = await request(app)
            .delete(`/api/comments/${commentId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(remove.status).toBe(200);
        expect(await Comment.findById(commentId)).toBeNull();
    });

    it("returns 403 when deleting another user's comment and 404 when missing", async () => {
        const { user: owner } = await createUserAndToken("comment-owner@mail.com");
        const { token: otherToken } = await createUserAndToken("comment-other@mail.com", "Other User");
        const comment = await Comment.create({
            user: owner._id,
            movieId: 42,
            content: "Owner comment",
        });

        const forbidden = await request(app)
            .delete(`/api/comments/${comment._id}`)
            .set("Authorization", `Bearer ${otherToken}`);

        expect(forbidden.status).toBe(403);

        const missing = await request(app)
            .delete("/api/comments/507f1f77bcf86cd799439011")
            .set("Authorization", `Bearer ${otherToken}`);

        expect(missing.status).toBe(404);
    });
});
