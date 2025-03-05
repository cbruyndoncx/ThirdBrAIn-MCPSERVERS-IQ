import { Request, Response, NextFunction } from 'express';
import { rateLimiter } from '../utils/rateLimit';
import { RateLimitExceededError } from '../errors';

export const rateLimitMiddleware = (type: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!rateLimiter.isAllowed(type)) {
            throw new RateLimitExceededError(`Rate limit exceeded for ${type}`);
        }

        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', '100');
        res.setHeader('X-RateLimit-Remaining',
            rateLimiter.getRemainingRequests(type).toString());
        res.setHeader('X-RateLimit-Reset',
            Math.floor(Date.now() / 1000 + 60).toString());

        next();
    };
};