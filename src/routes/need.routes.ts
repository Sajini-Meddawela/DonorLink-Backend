import { Router } from 'express';
import { NeedController } from '../controllers/need.controller';

const router = Router();

// Get all needs for a specific care home
router.get('/carehome/:careHomeId', NeedController.getAllNeeds);

// Get a specific need by ID
router.get('/:id', NeedController.getNeedById);

// Create a new need for a care home
router.post('/', NeedController.createNeed);

// Update a need
router.put('/:id', NeedController.updateNeed);

// Delete a need
router.delete('/:id', NeedController.deleteNeed);

// Search needs within a care home
router.get('/search', NeedController.searchNeeds);

export default router;