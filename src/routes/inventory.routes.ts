import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', InventoryController.getAllItems);
router.get('/:id', InventoryController.getItemById);
router.post('/', InventoryController.createItem);
router.put('/:id', InventoryController.updateItem);
router.delete('/:id', InventoryController.deleteItem);
router.get('/search', InventoryController.searchItems);
router.post('/bulk-import', InventoryController.bulkImport);
router.delete('/bulk-delete', InventoryController.bulkDelete);

export default router;