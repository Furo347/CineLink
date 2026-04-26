import request = require("supertest");
import app from "../../src/app";

type RegisterOverrides = Partial<{
    name: string;
    email: string;
    password: string;
    avatar: "avatar1" | "avatar2" | "avatar3" | "avatar4" | "avatar5";
}>;

export async function registerUser(overrides: RegisterOverrides = {}) {
    return request(app)
        .post("/api/auth/register")
        .send({
            name: "Test User",
            email: "testuser@mail.com",
            password: "Password123!",
            avatar: "avatar1",
            ...overrides,
        });
}

export async function loginUser(
    overrides: Partial<{ email: string; password: string }> = {}
) {
    return request(app)
        .post("/api/auth/login")
        .send({
            email: "testuser@mail.com",
            password: "Password123!",
            ...overrides,
        });
}

export async function getAuthToken() {
    await registerUser();
    const loginRes = await loginUser();
    return loginRes.body.token as string;
}
