import mongoose from "mongoose";

export const connectDB = async (mongoUri?: string) => {
    try {
        const uri = mongoUri || process.env.MONGO_URI!;
        await mongoose.connect(uri);
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};
