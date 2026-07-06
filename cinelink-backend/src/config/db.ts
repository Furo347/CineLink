import mongoose from "mongoose";
import { logger } from "./logger";

export const connectDB = async (mongoUri?: string) => {
    try {
        const uri = mongoUri || process.env.MONGO_URI!;

        if (!uri) {
            throw new Error("MONGO_URI is missing");
        }

        await mongoose.connect(uri);
        logger.info("MongoDB connected");

    } catch (err) {
        logger.error("MongoDB connection error", { error: err });
        process.exit(1);
    }
};
