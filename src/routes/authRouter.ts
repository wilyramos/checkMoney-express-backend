import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";


const router = Router();


router.post('/create-account',
    body('name')
        .notEmpty().withMessage('Name is required'),

    body('password')
        .isLength({ min: 6 }).withMessage('Passwor must be at least 6 characters'),

    body('email')
        .isEmail().withMessage('Email is not valid'),

    handleInputErrors,

    AuthController.createAccount);


export default router;