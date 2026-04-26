import { Router } from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/authController";
import rateLimit from "express-rate-limit";

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    skip: () => process.env.NODE_ENV === "test",
    message: {
        message: "Trop de tentatives, réessayez plus tard",
    },
});

router.post(
    "/register",
    authLimiter,
    [
        body("name")
            .isString()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("Le nom doit contenir entre 2 et 50 caractères"),
        body("email").isEmail().withMessage("Email invalide"),
        body("password")
            .isLength({ min: 8 })
            .withMessage("Le mot de passe doit contenir au moins 8 caractères")
            .matches(/[A-Z]/)
            .withMessage("Le mot de passe doit contenir au moins une majuscule")
            .matches(/[a-z]/)
            .withMessage("Le mot de passe doit contenir au moins une minuscule")
            .matches(/[0-9]/)
            .withMessage("Le mot de passe doit contenir au moins un chiffre")
            .matches(/[^A-Za-z0-9]/)
            .withMessage("Le mot de passe doit contenir au moins un caractère spécial"),
        body("avatar")
            .optional()
            .isIn(["avatar1", "avatar2", "avatar3", "avatar4", "avatar5"])
            .withMessage("Avatar invalide"),
    ],
    register
);

router.post(
    "/login",
    authLimiter,
    [
        body("email").isEmail(),
        body("password").exists()
    ],
    login
);

export default router;
