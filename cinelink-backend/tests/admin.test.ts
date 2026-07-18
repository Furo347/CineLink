import request = require("supertest");
import app from "../src/app";
import Activity from "../src/models/Activity";
import Comment from "../src/models/Comment";
import Favorite from "../src/models/Favorite";
import Follow from "../src/models/Follow";
import User from "../src/models/User";
import { loginUser, registerUser } from "./helpers/auth";

async function createUser(email: string, role: "USER" | "ADMIN" = "USER") {
    await registerUser({ email, name: role === "ADMIN" ? "Admin User" : "Regular User" });
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Expected user to be created");
    }

    user.role = role;
    await user.save();

    const loginRes = await loginUser({ email });
    return { user, token: loginRes.body.token as string };
}

describe("RBAC and admin routes", () => {
    it("does not allow ADMIN role injection during registration", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Malicious User",
                email: "malicious@mail.com",
                password: "Password123!",
                avatar: "avatar1",
                role: "ADMIN",
            });

        expect(res.status).toBe(201);
        expect(res.body.user.role).toBe("USER");

        const user = await User.findOne({ email: "malicious@mail.com" });
        expect(user?.role).toBe("USER");
    });

    it("returns 401 when admin route is called without authentication", async () => {
        const res = await request(app).get("/api/admin/stats");

        expect(res.status).toBe(401);
    });

    it("returns 401 when admin route is called with an invalid token", async () => {
        const res = await request(app)
            .get("/api/admin/stats")
            .set("Authorization", "Bearer invalid-token");

        expect(res.status).toBe(401);
    });

    it("returns 401 when the authenticated user no longer exists", async () => {
        const { token, user } = await createUser("deleted-admin@mail.com", "ADMIN");
        await User.deleteOne({ _id: user._id });

        const res = await request(app)
            .get("/api/admin/stats")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/introuvable/i);
    });

    it("returns 403 when a USER calls an admin route", async () => {
        const { token } = await createUser("standard@mail.com");

        const res = await request(app)
            .get("/api/admin/stats")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(403);
    });

    it("returns stats for an ADMIN", async () => {
        const { token } = await createUser("stats-admin@mail.com", "ADMIN");

        const res = await request(app)
            .get("/api/admin/stats")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.objectContaining({
                users: expect.any(Number),
                comments: expect.any(Number),
                favorites: expect.any(Number),
                follows: expect.any(Number),
            })
        );
    });

    it("deletes any comment as ADMIN", async () => {
        const { token } = await createUser("comment-admin@mail.com", "ADMIN");
        const owner = await createUser("comment-owner@mail.com");
        const comment = await Comment.create({
            user: owner.user._id,
            movieId: 42,
            content: "A supprimer",
        });
        await Activity.create({
            actor: owner.user._id,
            type: "COMMENT_MOVIE",
            targetMovie: 42,
            payload: { comment },
        });

        const res = await request(app)
            .delete(`/api/admin/comments/${comment._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(204);
        expect(await Comment.findById(comment._id)).toBeNull();
        expect(await Activity.countDocuments({ type: "COMMENT_MOVIE" })).toBe(0);
    });

    it("deletes legacy comment activities matched by content", async () => {
        const { token } = await createUser("legacy-comment-admin@mail.com", "ADMIN");
        const owner = await createUser("legacy-comment-owner@mail.com");
        const comment = await Comment.create({
            user: owner.user._id,
            movieId: 43,
            content: "Ancienne activité",
        });
        await Activity.create({
            actor: owner.user._id,
            type: "COMMENT_MOVIE",
            targetMovie: 43,
            payload: { comment: "Ancienne activité" },
        });

        const res = await request(app)
            .delete(`/api/admin/comments/${comment._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(204);
        expect(await Activity.countDocuments({ type: "COMMENT_MOVIE" })).toBe(0);
    });

    it("validates comment ids and returns 404 for missing comments", async () => {
        const { token } = await createUser("comment-check-admin@mail.com", "ADMIN");

        const invalid = await request(app)
            .delete("/api/admin/comments/not-an-id")
            .set("Authorization", `Bearer ${token}`);

        expect(invalid.status).toBe(400);

        const missing = await request(app)
            .delete("/api/admin/comments/507f1f77bcf86cd799439011")
            .set("Authorization", `Bearer ${token}`);

        expect(missing.status).toBe(404);
    });

    it("deletes a user and cleans directly related data", async () => {
        const { token } = await createUser("delete-admin@mail.com", "ADMIN");
        const target = await createUser("delete-target@mail.com");
        const follower = await createUser("delete-follower@mail.com");

        await Comment.create({ user: target.user._id, movieId: 42, content: "Commentaire" });
        await Favorite.create({ user: target.user._id, tmdbId: 42, title: "Film" });
        await Follow.create({ follower: follower.user._id, following: target.user._id });
        await Follow.create({ follower: target.user._id, following: follower.user._id });
        await Activity.create({ actor: target.user._id, type: "ADD_FAVORITE", targetMovie: 42 });
        await Activity.create({ actor: follower.user._id, type: "FOLLOW_USER", targetUser: target.user._id });

        const res = await request(app)
            .delete(`/api/admin/users/${target.user._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.cleanup).toMatchObject({
            comments: "supprimés",
            favorites: "supprimés",
        });
        expect(await User.findById(target.user._id)).toBeNull();
        expect(await Comment.countDocuments({ user: target.user._id })).toBe(0);
        expect(await Favorite.countDocuments({ user: target.user._id })).toBe(0);
        expect(
            await Follow.countDocuments({
                $or: [{ follower: target.user._id }, { following: target.user._id }],
            })
        ).toBe(0);
        expect(
            await Activity.countDocuments({
                $or: [{ actor: target.user._id }, { targetUser: target.user._id }],
            })
        ).toBe(0);
    });

    it("prevents an ADMIN from deleting itself", async () => {
        const { token, user } = await createUser("self-delete-admin@mail.com", "ADMIN");

        const res = await request(app)
            .delete(`/api/admin/users/${user._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/propre compte/i);
        expect(await User.findById(user._id)).not.toBeNull();
    });

    it("validates user ids and returns 404 for missing users", async () => {
        const { token } = await createUser("user-check-admin@mail.com", "ADMIN");

        const invalid = await request(app)
            .delete("/api/admin/users/not-an-id")
            .set("Authorization", `Bearer ${token}`);

        expect(invalid.status).toBe(400);

        const missing = await request(app)
            .delete("/api/admin/users/507f1f77bcf86cd799439011")
            .set("Authorization", `Bearer ${token}`);

        expect(missing.status).toBe(404);
    });
});
