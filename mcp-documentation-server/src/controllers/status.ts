import { Request, Response } from 'express';
import { healthChecker } from '../utils/health';
import { metrics } from '../utils/metrics';
import { cacheManager } from '../utils/cache';
import { rateLimiter } from '../utils/rateLimit';

export const statusController = (req: Request, res: Response) => {
    const health = healthChecker.getStatus();
    const cacheStats = cacheManager.getStats();
    const currentMetrics = metrics.getMetrics();

    res.json({
        status: health.status,
        version: health.version,
        uptime: health.uptime,
        metrics: currentMetrics,
        cache: cacheStats,
        rateLimits: {
            search: rateLimiter.getRemainingRequests('search'),
            analyze: rateLimiter.getRemainingRequests('analyze')
        },
        lastError: health.lastError
    });
};

export const metricsController = (req: Request, res: Response) => {
    res.json({
        process: {
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            uptime: process.uptime(),
            pid: process.pid
        },
        metrics: metrics.getMetrics(),
        health: healthChecker.getStatus(),
        cache: cacheManager.getStats(),
        rateLimits: {
            search: rateLimiter.getRemainingRequests('search'),
            analyze: rateLimiter.getRemainingRequests('analyze')
        }
    });
};