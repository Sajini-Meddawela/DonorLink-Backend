import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import UserController from '../controllers/user.controller';

const router = express.Router();

// Get current user profile (protected route)
router.get('/me', authenticate, UserController.getCurrentUser);

// Get all users (protected route)
router.get('/', authenticate, UserController.getAllUsers);

// Get user by ID (owner only)
router.get('/:id', authenticate, UserController.getUserById);

// Update user profile (owner only)
router.put('/:id', authenticate, UserController.updateUser);

// Delete user (owner only)
router.delete('/:id', authenticate, UserController.deleteUser);

// Get users by role (protected route)
router.get('/role/:role', authenticate, UserController.getUsersByRole);

export default router;