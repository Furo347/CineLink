import request = require("supertest");
import app from "../src/app";
import { registerUser, loginUser } from "./helpers/auth";

describe("Auth routes", () => {
    describe("POST /api/auth/register", () => {
        it("should register a user with valid payload", async () => {
            const res = await registerUser();

            expect(res.status).toBe(201);
            expect(res.body.token).toBeDefined();
            expect(res.body.user).toBeDefined();
            expect(res.body.user.name).toBe("Test User");
            expect(res.body.user.email).toBe("testuser@mail.com");
            expect(res.body.user.avatar).toBe("avatar1");
        });

        it("should use avatar1 by default when avatar is omitted", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Default Avatar",
                    email: "defaultavatar@mail.com",
                    password: "password123",
                });

            expect(res.status).toBe(201);
            expect(res.body.user.avatar).toBe("avatar1");
        });

        it("should return 400 when name is missing", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    email: "missingname@mail.com",
                    password: "password123",
                    avatar: "avatar1",
                });

            expect(res.status).toBe(400);
        });

        it("should return 400 when avatar is invalid", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Bad Avatar",
                    email: "badavatar@mail.com",
                    password: "password123",
                    avatar: "avatar999",
                });

            expect(res.status).toBe(400);
        });

        it("should return 400 when email is already used", async () => {
            await registerUser();
            const res = await registerUser();

            expect(res.status).toBe(400);
        });
    });

    describe("POST /api/auth/login", () => {
        it("should login with valid credentials", async () => {
            await registerUser();

            const res = await loginUser();

            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined();
            expect(res.body.user).toBeDefined();
            expect(res.body.user.name).toBe("Test User");
            expect(res.body.user.avatar).toBe("avatar1");
        });

        it("should return 400 for invalid credentials", async () => {
            await registerUser();

            const res = await loginUser({ password: "wrongpassword" });

            expect(res.status).toBe(400);
        });
    });
});
