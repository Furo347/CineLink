import request = require("supertest");
import app from "../src/app";
import Activity from "../src/models/Activity";
import Follow from "../src/models/Follow";
import { registerUser, loginUser } from "./helpers/auth";

jest.mock("axios", () => ({
    get: jest.fn(async () => ({
        data: {
            id: 123,
            title: "Mock Movie",
            poster_path: "/mock-poster.jpg",
            overview: "Mock overview",
            vote_average: 8.2,
            release_date: "2024-01-01",
        },
    })),
}));

async function createLoggedUser(email: string, name: string, avatar = "avatar1") {
    const registerRes = await registerUser({
        email,
        name,
        avatar: avatar as any,
    });

    const loginRes = await loginUser({
        email,
        password: "Password123!",
    });

    return {
        token: loginRes.body.token as string,
        user: registerRes.body.user,
    };
}

describe("GET /api/feed", () => {
    it("should return 401 without token", async () => {
        const res = await request(app).get("/api/feed");

        expect(res.status).toBe(401);
    });

    it("should return an empty feed when user follows nobody", async () => {
        const viewer = await createLoggedUser(
            "viewer@mail.com",
            "Viewer User"
        );

        const res = await request(app)
            .get("/api/feed")
            .set("Authorization", `Bearer ${viewer.token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("should return enriched movie activity", async () => {
        const viewer = await createLoggedUser(
            "viewer@mail.com",
            "Viewer User"
        );

        const actor = await createLoggedUser(
            "actor@mail.com",
            "Actor User",
            "avatar2"
        );

        await Follow.create({
            follower: viewer.user.id,
            following: actor.user.id,
        });

        await Activity.create({
            type: "RATE_MOVIE",
            actor: actor.user.id,
            targetMovie: 123,
            payload: {
                rating: 8,
            },
        });

        const res = await request(app)
            .get("/api/feed")
            .set("Authorization", `Bearer ${viewer.token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);

        const activity = res.body[0];

        expect(activity.actor.avatar).toBe("avatar2");

        expect(activity.movie).toBeDefined();
        expect(activity.movie.title).toBe("Mock Movie");
        expect(activity.movie.poster).toContain("/mock-poster.jpg");
        expect(activity.movie.vote_average).toBe(8.2);

        expect(activity.payload.rating).toBe(8);
    });

    it("should return activity without movie when targetMovie is missing", async () => {
        const viewer = await createLoggedUser(
            "viewer@mail.com",
            "Viewer User"
        );

        const actor = await createLoggedUser(
            "actor@mail.com",
            "Actor User"
        );

        await Follow.create({
            follower: viewer.user.id,
            following: actor.user.id,
        });

        await Activity.create({
            type: "FOLLOW",
            actor: actor.user.id,
            payload: {
                message: "followed someone",
            },
        });

        const res = await request(app)
            .get("/api/feed")
            .set("Authorization", `Bearer ${viewer.token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);

        const activity = res.body[0];

        expect(activity.movie).toBeNull();
        expect(activity.payload.message).toBeDefined();
    });
});
