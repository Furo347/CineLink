import mongoose from "mongoose";

export const connectDB = async (mongoUri?: string) => {
    try {
        const uri = mongoUri || process.env.MONGO_URI!;

        if (!uri) {
            throw new Error("MONGO_URI is missing");
        }

        await mongoose.connect(uri);
        console.log("MongoDB connected");

    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};
