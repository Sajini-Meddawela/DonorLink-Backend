import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AppError } from '../middleware/error.midleware';
import { Role } from '@prisma/client';

class UserController {
  static async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Not authenticated');
      }
      const user = await UserService.findUserById(req.user.id);
      res.json(user);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to fetch user');
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (error) {
      throw new AppError(500, 'Failed to fetch users');
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid user ID');
      }

      // Only allow the same user to access
      if (req.user?.id !== id) {
        throw new AppError(403, 'Forbidden');
      }

      const user = await UserService.findUserById(id);
      if (!user) {
        throw new AppError(404, 'User not found');
      }
      res.json(user);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to fetch user');
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid user ID');
      }

      // Only allow the same user to update
      if (req.user?.id !== id) {
        throw new AppError(403, 'Forbidden');
      }

      const updatedUser = await UserService.updateUser(id, req.body);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to update user');
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid user ID');
      }

      // Only allow the same user to delete
      if (req.user?.id !== id) {
        throw new AppError(403, 'Forbidden');
      }

      await UserService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to delete user');
    }
  }

  static async getUsersByRole(req: Request, res: Response) {
    try {
      const role = req.params.role as Role;
      if (!Object.values(Role).includes(role)) {
        throw new AppError(400, 'Invalid role');
      }
      
      const users = await UserService.getUsersByRole(role);
      res.json(users);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to fetch users by role');
    }
  }
}

export default UserController;