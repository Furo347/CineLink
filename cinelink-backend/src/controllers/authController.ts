import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { validationResult } from "express-validator";

dotenv.config();

if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
    if (process.env.NODE_ENV !== "test") {
        throw new Error("JWT_SECRET et JWT_EXPIRES_IN doivent être définis");
    }
}


const jwtSecret = process.env.JWT_SECRET as string;
const jwtExpires = process.env.JWT_EXPIRES_IN as string;

export const register = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, name } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email déjà utilisé" });

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const user = new User({ email, password: hashed, name });
        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            jwtSecret,
            { expiresIn: jwtExpires } as jwt.SignOptions
        );

        res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const login = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Identifiants invalides" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Identifiants invalides" });

        const token = jwt.sign(
            { userId: user._id },
            jwtSecret,
            { expiresIn: jwtExpires } as jwt.SignOptions
        );

        res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
