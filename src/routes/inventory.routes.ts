import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';

const router = Router();

router.get('/', InventoryController.getAllItems);

router.get('/:id', InventoryController.getItemById);

router.post('/', InventoryController.createItem);

router.put('/:id', InventoryController.updateItem);

router.delete('/:id', InventoryController.deleteItem);

router.get('/search', InventoryController.searchItems);

export default router;