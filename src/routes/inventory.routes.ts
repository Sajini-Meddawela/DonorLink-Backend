import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';

const router = Router();

// GET all inventory items
router.get('/', InventoryController.getAllItems);

// GET a specific inventory item
router.get('/:id', InventoryController.getItemById);

// POST create a new inventory item
router.post('/', InventoryController.createItem);

// PUT update an existing inventory item
router.put('/:id', InventoryController.updateItem);

// DELETE an inventory item
router.delete('/:id', InventoryController.deleteItem);

// GET search inventory items
router.get('/search', InventoryController.searchItems);

export default router;