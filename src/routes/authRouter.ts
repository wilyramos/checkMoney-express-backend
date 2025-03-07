import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { limiter } from "../config/limiter";
import { authenticate } from "../middleware/auth";


const router = Router();

// Limit the number of requests to the API
router.use(limiter);

router.post('/create-account',
    body('name')
        .notEmpty().withMessage('Name is required'),

    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    body('email')
        .isEmail().withMessage('Email is not valid'),

    handleInputErrors,
    AuthController.createAccount
);

router.post('/confirm-account',
    limiter,
    body('token')
        .notEmpty()
        .isLength({ min: 6, max: 6 })
        .withMessage('Token no valido'),

    handleInputErrors,
    AuthController.confirmAccount
);

router.post('/login',
    body('email')
        .isEmail().withMessage('Email is not valid'),

    body('password')
        .notEmpty().withMessage('Password is required'),

    handleInputErrors,
    AuthController.login
)

router.post('/forgot-password',

    body('email')
        .isEmail().withMessage('Email is not valid'),

    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token')
        .notEmpty()
        .isLength({ min: 6, max: 6 })
        .withMessage('Token no valido'),

    handleInputErrors,
    AuthController.validateToken
)

router.post('/reset-password/:token',
    param('token')
        .isLength({ min: 6, max: 6 })
        .withMessage('Token no valido'),

    body('password')
        .isLength({ min: 6 }).withMessage('Passwor must be at least 6 characters'),

    handleInputErrors,
    AuthController.resetPasswordWithToken
)

router.get('/user',
    authenticate,
    AuthController.user
)

router.post('/update-password',
    authenticate,
    body('current_password')
        .notEmpty().withMessage('Current password is required'),

    body('password')
        .isLength({ min: 6 }).withMessage('Passwor must be at least 6 characters'),

    handleInputErrors,
    AuthController.updateCurrentPassword
)

router.post('/check-password',
    authenticate,
    body('password')
        .notEmpty().withMessage('Password is required'),
    
    handleInputErrors,
    AuthController.checkPassword
)


export default router;