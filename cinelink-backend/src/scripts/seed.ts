import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/User";
import Favorite from "../models/Favorite";
import Comment from "../models/Comment";
import Follow from "../models/Follow";
import Activity from "../models/Activity";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error("MONGO_URI manquant dans le .env");
}

const demoUsers = [
    {
        name: "Florentin",
        email: "florentin.demo@cinelink.fr",
        password: "CineLink2026!",
        avatar: "avatar1",
    },
    {
        name: "Alice",
        email: "alice.demo@cinelink.fr",
        password: "CineLink2026!",
        avatar: "avatar2",
    },
    {
        name: "Lucas",
        email: "lucas.demo@cinelink.fr",
        password: "CineLink2026!",
        avatar: "avatar3",
    },
    {
        name: "Emma",
        email: "emma.demo@cinelink.fr",
        password: "CineLink2026!",
        avatar: "avatar4",
    },
];

const demoMovies = [
    { tmdbId: 27205, title: "Inception" },
    { tmdbId: 155, title: "The Dark Knight" },
    { tmdbId: 157336, title: "Interstellar" },
    { tmdbId: 550, title: "Fight Club" },
];

async function upsertUsers() {
    const passwordHash = await bcrypt.hash("CineLink2026!", 10);

    const users: any[] = [];

    for (const demoUser of demoUsers) {
        const passwordHash = await bcrypt.hash(demoUser.password, 10);

        const user = await User.findOneAndUpdate(
            { email: demoUser.email },
            {
                $setOnInsert: {
                    name: demoUser.name,
                    email: demoUser.email,
                    password: passwordHash,
                    avatar: demoUser.avatar,
                },
            },
            { upsert: true, new: true }
        );

        users.push(user);
    }

    return users;
}

async function ensureFavorite(userId: mongoose.Types.ObjectId, movie: { tmdbId: number; title: string }, rating?: number) {
    const favorite = await Favorite.findOneAndUpdate(
        { user: userId, tmdbId: movie.tmdbId },
        {
            $setOnInsert: {
                user: userId,
                tmdbId: movie.tmdbId,
                title: movie.title,
            },
            ...(rating !== undefined ? { $set: { rating } } : {}),
        },
        { upsert: true, new: true }
    );

    await Activity.findOneAndUpdate(
        {
            actor: userId,
            type: "ADD_FAVORITE",
            targetMovie: movie.tmdbId,
        },
        {
            $setOnInsert: {
                actor: userId,
                type: "ADD_FAVORITE",
                targetMovie: movie.tmdbId,
            },
        },
        { upsert: true, new: true }
    );

    if (rating !== undefined) {
        await Activity.findOneAndUpdate(
            {
                actor: userId,
                type: "RATE_MOVIE",
                targetMovie: movie.tmdbId,
            },
            {
                $set: {
                    actor: userId,
                    type: "RATE_MOVIE",
                    targetMovie: movie.tmdbId,
                    payload: { rating },
                },
            },
            { upsert: true, new: true }
        );
    }

    return favorite;
}

async function ensureComment(userId: mongoose.Types.ObjectId, movieId: number, content: string) {
    const comment = await Comment.findOneAndUpdate(
        { user: userId, movieId, content },
        {
            $setOnInsert: {
                user: userId,
                movieId,
                content,
            },
        },
        { upsert: true, new: true }
    );

    await Activity.findOneAndUpdate(
        {
            actor: userId,
            type: "COMMENT_MOVIE",
            targetMovie: movieId,
            "payload.comment": content,
        },
        {
            $setOnInsert: {
                actor: userId,
                type: "COMMENT_MOVIE",
                targetMovie: movieId,
                payload: { comment: content },
            },
        },
        { upsert: true, new: true }
    );await Activity.findOneAndUpdate(
        {
            actor: userId,
            type: "COMMENT_MOVIE",
            targetMovie: movieId,
            "payload.comment": content,
        },
        {
            $setOnInsert: {
                actor: userId,
                type: "COMMENT_MOVIE",
                targetMovie: movieId,
                payload: { comment: content },
            },
        },
        { upsert: true, new: true }
    );await Activity.findOneAndUpdate(
        {
            actor: userId,
            type: "COMMENT_MOVIE",
            targetMovie: movieId,
            "payload.comment": content,
        },
        {
            $setOnInsert: {
                actor: userId,
                type: "COMMENT_MOVIE",
                targetMovie: movieId,
                payload: { comment: content },
            },
        },
        { upsert: true, new: true }
    );
}

async function ensureFollow(followerId: mongoose.Types.ObjectId, followingId: mongoose.Types.ObjectId) {
    await Follow.findOneAndUpdate(
        { follower: followerId, following: followingId },
        {
            $setOnInsert: {
                follower: followerId,
                following: followingId,
            },
        },
        { upsert: true, new: true }
    );

    await Activity.findOneAndUpdate(
        {
            actor: followerId,
            type: "FOLLOW_USER",
            targetUser: followingId,
        },
        {
            $setOnInsert: {
                actor: followerId,
                type: "FOLLOW_USER",
                targetUser: followingId,
            },
        },
        { upsert: true, new: true }
    );
}

async function seed() {
    await mongoose.connect(MONGO_URI as string);
    console.log("MongoDB connecté");

    const [florentin, alice, lucas, emma] = await upsertUsers();

    await ensureFavorite(florentin._id, demoMovies[0], 10);
    await ensureFavorite(florentin._id, demoMovies[2], 9);

    await ensureFavorite(alice._id, demoMovies[1], 8);
    await ensureFavorite(alice._id, demoMovies[3], 7);

    await ensureFavorite(lucas._id, demoMovies[0], 9);
    await ensureFavorite(emma._id, demoMovies[2], 10);

    await ensureComment(alice._id, 27205, "Un film incroyable, très marquant visuellement.");
    await ensureComment(lucas._id, 157336, "Une ambiance folle et une bande-son superbe.");
    await ensureComment(emma._id, 550, "Un classique à revoir absolument.");

    await ensureFollow(florentin._id, alice._id);
    await ensureFollow(florentin._id, lucas._id);
    await ensureFollow(alice._id, emma._id);

    console.log("Seed terminé avec succès");
    console.log("Comptes démo :");
    console.log("florentin.demo@cinelink.fr / CineLink2026!");
    console.log("alice.demo@cinelink.fr / CineLink2026!");
    console.log("lucas.demo@cinelink.fr / CineLink2026!");
    console.log("emma.demo@cinelink.fr / CineLink2026!");

    await mongoose.disconnect();
}

seed().catch(async (err) => {
    console.error("Erreur seed:", err);
    await mongoose.disconnect();
    process.exit(1);
});
