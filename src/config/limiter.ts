import { rateLimit } from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // limit each IP to 100 requests per windowMs
    message: {"error": "Too many requests, please try again later"}
})