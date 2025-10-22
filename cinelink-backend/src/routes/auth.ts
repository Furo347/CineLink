import { Router } from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/authController";

const router = Router();

router.post(
    "/register",
    [
        body("email").isEmail().withMessage("Email invalide"),
        body("password").isLength({ min: 6 }).withMessage("Mot de passe >= 6"),
        body("name").optional().isString()
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
