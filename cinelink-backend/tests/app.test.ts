import request from "supertest";
import app from "../src/app";

describe("App basic test", () => {
    it("should respond with 404 on unknown route", async () => {
        const res = await request(app).get("/unknown-route");

        expect(res.status).toBe(404);
    });
});
