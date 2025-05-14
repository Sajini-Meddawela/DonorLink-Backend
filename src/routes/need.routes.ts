import { Router } from 'express';
import { NeedController } from '../controllers/need.controller';

const router = Router();

router.get('/', NeedController.getAllNeeds);

router.get('/:id', NeedController.getNeedById);

router.post('/', NeedController.createNeed);

router.put('/:id', NeedController.updateNeed);

router.delete('/:id', NeedController.deleteNeed);

router.get('/search', NeedController.searchNeeds);

export default router;