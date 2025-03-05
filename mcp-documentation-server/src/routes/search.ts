import { Router } from 'express';
import { searchController } from '../controllers/search';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { cacheMiddleware } from '../middleware/cache';
import { validateSearch } from '../middleware/validation';

const router = Router();

router.post('/',
    rateLimitMiddleware('search'),
    validateSearch,
    cacheMiddleware('search'),
    searchController
);

export default router;