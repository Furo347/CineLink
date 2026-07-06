import fs from "fs";
import path from "path";
import winston from "winston";

const logsDirectory = path.resolve(__dirname, "../../logs");

if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory, { recursive: true });
}

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: logFormat,
    transports: [
        new winston.transports.File({
            filename: path.join(logsDirectory, "error.log"),
            level: "error",
        }),
        new winston.transports.File({
            filename: path.join(logsDirectory, "app.log"),
        }),
    ],
});

if (process.env.NODE_ENV === "development") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    );
}
