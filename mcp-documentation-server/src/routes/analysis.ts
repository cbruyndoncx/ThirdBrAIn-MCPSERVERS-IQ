import { Router } from 'express';
import { analysisController } from '../controllers/analysis';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { cacheMiddleware } from '../middleware/cache';
import { validateAnalysis } from '../middleware/validation';

const router = Router();

router.post('/',
    rateLimitMiddleware('analyze'),
    validateAnalysis,
    cacheMiddleware('analyze'),
    analysisController
);

export default router;