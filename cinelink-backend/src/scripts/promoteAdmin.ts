import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User";

dotenv.config();

async function main() {
    const email = process.argv[2] || process.env.ADMIN_EMAIL;

    if (!email) {
        throw new Error("Usage: npm run admin:promote -- user@example.com ou ADMIN_EMAIL=user@example.com");
    }

    await connectDB();

    const user = await User.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { role: "ADMIN" },
        { new: true }
    ).select("_id email role");

    if (!user) {
        throw new Error(`Aucun utilisateur trouvé pour ${email}`);
    }

    console.log(`Utilisateur promu ADMIN: ${user.email}`);
}

main()
    .catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
    });
