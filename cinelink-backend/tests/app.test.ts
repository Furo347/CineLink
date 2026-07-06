import request = require("supertest");
import app from "../src/app";

describe("App basic test", () => {
    it("should expose the health endpoint", async () => {
        const res = await request(app).get("/api/health");

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            status: "UP",
            database: "UP",
            environment: "test",
            version: "1.0.0",
        });
        expect(typeof res.body.uptime).toBe("number");
        expect(new Date(res.body.timestamp).toString()).not.toBe("Invalid Date");
        expect(res.body.memory).toEqual({
            rss: expect.any(Number),
            heapTotal: expect.any(Number),
            heapUsed: expect.any(Number),
        });
    });

    it("should respond with 404 on unknown route", async () => {
        const res = await request(app).get("/unknown-route");

        expect(res.status).toBe(404);
    });
});
