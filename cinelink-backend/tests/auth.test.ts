import request from "supertest";
import app from "../src/server";
import mongoose from "mongoose";

describe("Auth routes", () => {
    beforeAll(async () => {
        // optionnel : connecter test DB si tu veux isoler (ici on suppose mongo déjà up)
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    it("Register and login flow", async () => {
        const email = `test${Date.now()}@example.com`;
        const password = "password123";

        const resRegister = await request(app)
            .post("/api/auth/register")
            .send({ email, password })
            .expect(201);

        expect(resRegister.body).toHaveProperty("token");

        const resLogin = await request(app)
            .post("/api/auth/login")
            .send({ email, password })
            .expect(200);

        expect(resLogin.body).toHaveProperty("token");
    });
});
