import request from "supertest";
import app from "../src/app";

describe("GET /api/comments/:movieId", () => {
    it("should return 200 even without authentication", async () => {
        const res = await request(app).get("/api/comments/123456");

        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toMatch(/json/);
    });
});
