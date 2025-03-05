import { Request, Response } from 'express';
import { analyzeCode } from '../handlers/codeAnalysisHandler';
import { metrics } from '../utils/metrics';
import { healthChecker } from '../utils/health';
import { cacheManager } from '../utils/cache';
import logger from '../utils/logger';

export const analysisController = async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
        metrics.increment('analyses');
        const analysis = await analyzeCode(req.body);

        // Cache results
        if (res.locals.cacheKey) {
            cacheManager.set(res.locals.cacheKey, analysis);
        }

        // Record metrics
        metrics.recordTiming('analysis_duration', Date.now() - startTime);

        // Add caching headers
        res.setHeader('Cache-Control', 'public, max-age=86400');
        if (res.locals.cacheKey) {
            res.setHeader('ETag', `"${res.locals.cacheKey}"`);
        }

        res.json({ success: true, analysis });
    } catch (error) {
        metrics.increment('errors');
        healthChecker.recordError(error);
        logger.error('Analysis error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                code: error.code || 'ANALYSIS_ERROR'
            }
        });
    }
};