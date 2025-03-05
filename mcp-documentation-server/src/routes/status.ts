import { Router } from 'express';
import { statusController, metricsController } from '../controllers/status';

const router = Router();

router.get('/status', statusController);
router.get('/metrics', metricsController);

export default router;