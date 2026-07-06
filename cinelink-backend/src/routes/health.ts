import fs from "fs";
import path from "path";
import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

const getPackageVersion = (): string => {
    try {
        const packageJsonPath = path.resolve(__dirname, "../../package.json");
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")) as {
            version?: string;
        };

        return packageJson.version || "unknown";
    } catch {
        return "unknown";
    }
};

router.get("/", (_req, res) => {
    const databaseStatus = mongoose.connection.readyState === 1 ? "UP" : "DOWN";
    const status = databaseStatus === "UP" ? "UP" : "DOWN";
    const memoryUsage = process.memoryUsage();

    res.status(status === "UP" ? 200 : 503).json({
        status,
        database: databaseStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        version: getPackageVersion(),
        memory: {
            rss: memoryUsage.rss,
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
        },
    });
});

export default router;
