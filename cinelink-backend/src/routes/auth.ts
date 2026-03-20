import { Router } from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/authController";

const router = Router();

router.post(
    "/register",
    [
        body("name")
            .isString()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("Le nom doit contenir entre 2 et 50 caractères"),
        body("email").isEmail().withMessage("Email invalide"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Mot de passe >= 6"),
        body("avatar")
            .optional()
            .isIn(["avatar1", "avatar2", "avatar3", "avatar4", "avatar5"])
            .withMessage("Avatar invalide"),
    ],
    register
);

router.post(
    "/login",
    [
        body("email").isEmail(),
        body("password").exists()
    ],
    login
);

export default router;
