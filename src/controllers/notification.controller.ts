import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";

export class NotificationController {
  static async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const notifications = await NotificationService.getUserNotifications(
        userId
      );
      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }

  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const count = await NotificationService.getUnreadCount(userId);
      res.status(200).json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        res.status(400).json({ error: "Invalid notification ID" });
        return;
      }

      const notification = await NotificationService.markAsRead(notificationId);
      res.status(200).json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  }

  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await NotificationService.markAllAsRead(userId);
      res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res
        .status(500)
        .json({ error: "Failed to mark all notifications as read" });
    }
  }

  static async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        res.status(400).json({ error: "Invalid notification ID" });
        return;
      }

      await NotificationService.deleteNotification(notificationId);
      res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  }

  static async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type, title, message, isRead, relatedId, actionUrl } =
        req.body;

      if (!userId || !type || !title || !message) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const notification = await NotificationService.createNotification({
        userId,
        type,
        title,
        message,
        isRead: isRead || false,
        relatedId,
        actionUrl,
        createdAt: new Date(),
      });

      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ error: "Failed to create notification" });
    }
  }
}
