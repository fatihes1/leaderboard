import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        status: 429,
        error: 'There are too many requests from this IP, please try again after an hour',
    },
    standardHeaders: true,
    legacyHeaders: false,
})