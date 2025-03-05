import { Request, Response, NextFunction } from 'express';
import { cacheManager } from '../utils/cache';

export const cacheMiddleware = (type: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const key = type === 'search' ?
            cacheManager.generateSearchKey(req.body) :
            cacheManager.generateAnalysisKey(req.body);

        const cachedData = cacheManager.get(key);
        if (cachedData) {
            // Add cache headers
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('ETag', `"${key}"`);
            return res.json({ success: true, results: cachedData });
        }

        // Store the key for later use
        res.locals.cacheKey = key;
        next();
    };
};