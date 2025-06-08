import { Router } from 'express';
import { CareHomeController } from '../controllers/carehome.controller';

const router = Router();

// Get paginated list of care homes with filters
router.get('/', CareHomeController.getCareHomes);

// Get specific care home details
router.get('/:id', CareHomeController.getCareHomeDetails);

export default router;