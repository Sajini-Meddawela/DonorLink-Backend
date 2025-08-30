import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", NotificationController.getNotifications);
router.get("/unread-count", NotificationController.getUnreadCount);
router.patch("/:id/read", NotificationController.markAsRead);
router.patch("/mark-all-read", NotificationController.markAllAsRead);
router.delete("/:id", NotificationController.deleteNotification);
router.post("/", NotificationController.createNotification);

export default router;