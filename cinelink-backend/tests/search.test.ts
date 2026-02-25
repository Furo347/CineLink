import * as supertest from "supertest";
import app from "../src/app";

const request = supertest.default;

describe("GET /api/search", () => {
    it("should return 401 if user is not authenticated", async () => {
        const res = await request(app)
            .get("/api/search")
            .query({ q: "batman" });

        expect(res.status).toBe(401);
    });
});
