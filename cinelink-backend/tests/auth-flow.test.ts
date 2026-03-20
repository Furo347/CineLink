import request = require("supertest");
import app from "../src/app";

describe("Authenticated flow", () => {
    it("should register, login and access protected route", async () => {
        const registerRes = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "testuser@mail.com",
                password: "password123",
                avatar: "avatar1",
            });

        expect(registerRes.status).toBe(201);
        expect(registerRes.body.token).toBeDefined();
        expect(registerRes.body.user).toBeDefined();
        expect(registerRes.body.user.name).toBe("Test User");
        expect(registerRes.body.user.avatar).toBe("avatar1");

        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: "testuser@mail.com",
                password: "password123",
            });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body.token).toBeDefined();
        expect(loginRes.body.user).toBeDefined();
        expect(loginRes.body.user.name).toBe("Test User");
        expect(loginRes.body.user.avatar).toBe("avatar1");

        const token = loginRes.body.token;

        const protectedRes = await request(app)
            .get("/api/feed")
            .set("Authorization", `Bearer ${token}`);

        expect(protectedRes.status).toBe(200);
    });
});
