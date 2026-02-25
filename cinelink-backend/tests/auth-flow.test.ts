import request = require("supertest");
import app from "../src/app";

describe("Authenticated flow", () => {
    it("should register, login and access protected route", async () => {
        // 1. Register
        const registerRes = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "testuser@mail.com",
                password: "password123",
            });

        expect(registerRes.status).toBe(201);
        expect(registerRes.body.token).toBeDefined();

        // 2. Login
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: "testuser@mail.com",
                password: "password123",
            });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body.token).toBeDefined();

        const token = loginRes.body.token;

        // 3. Access protected route
        const protectedRes = await request(app)
            .get("/api/feed")
            .set("Authorization", `Bearer ${token}`);

        expect(protectedRes.status).toBe(200);
    });
});
