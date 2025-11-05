import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const jwtSecret = process.env.JWT_SECRET || "dev_secret";

export interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Non authorisé" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Non authorisé" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload & { userId: string };
    (req as any).user = { id: decoded.userId };

    try {
        const payload = jwt.verify(token, jwtSecret) as any;
        req.userId = payload.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
};
