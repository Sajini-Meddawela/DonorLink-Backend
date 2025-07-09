import { Router } from 'express';
import { NeedController } from '../controllers/need.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Get all needs for authenticated user (care home)
router.get('/', authenticate, authorize([Role.CAREHOME]), NeedController.getAllNeeds);

// Get needs for a specific user (care home profile view)
router.get('/user/:userId', authenticate, NeedController.getUserNeeds);

// Other routes remain the same...
// Get a specific need by ID
router.get('/:id', authenticate, NeedController.getNeedById);

// Create a new need
router.post('/', authenticate, authorize([Role.CAREHOME]), NeedController.createNeed);

// Update a need
router.put('/:id', authenticate, authorize([Role.CAREHOME]), NeedController.updateNeed);

// Delete a need
router.delete('/:id', authenticate, authorize([Role.CAREHOME]), NeedController.deleteNeed);
// Get needs for a specific care home (for donors)
router.get('/carehome/:careHomeId', authenticate, NeedController.getCareHomeNeeds);

export default router;