import { Router } from 'express';
import searchRoutes from './search';
import analysisRoutes from './analysis';
import statusRoutes from './status';

const router = Router();

router.use('/api/search', searchRoutes);
router.use('/api/analyze', analysisRoutes);
router.use('/api', statusRoutes);

export default router;