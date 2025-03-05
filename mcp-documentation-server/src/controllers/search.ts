import { Request, Response } from 'express';
import { searchDocumentation } from '../handlers/searchHandler';
import { metrics } from '../utils/metrics';
import { healthChecker } from '../utils/health';
import { cacheManager } from '../utils/cache';
import logger from '../utils/logger';

export const searchController = async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
        metrics.increment('searches');
        const results = await searchDocumentation(req.body);

        // Cache results
        if (res.locals.cacheKey) {
            cacheManager.set(res.locals.cacheKey, results);
        }

        // Record metrics
        metrics.recordTiming('search_duration', Date.now() - startTime);

        // Add caching headers
        res.setHeader('Cache-Control', 'public, max-age=3600');
        if (res.locals.cacheKey) {
            res.setHeader('ETag', `"${res.locals.cacheKey}"`);
        }

        res.json({ success: true, results });
    } catch (error) {
        metrics.increment('errors');
        healthChecker.recordError(error);
        logger.error('Search error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                code: error.code || 'SEARCH_ERROR'
            }
        });
    }
};