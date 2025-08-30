import {
  PrismaClient,
  Notification as PrismaNotification,
} from "@prisma/client";

const prisma = new PrismaClient();

export interface NotificationDTO {
  id?: number;
  userId: number;
  type:
    | "LOW_STOCK"
    | "NEW_DONATION"
    | "DONATION_STATUS"
    | "MEAL_BOOKING"
    | "SYSTEM";
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: number;
  createdAt: Date;
  actionUrl?: string;
}

function toDTO(notification: PrismaNotification): NotificationDTO {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type as any,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    relatedId: notification.relatedId || undefined,
    createdAt: notification.createdAt,
    actionUrl: notification.actionUrl || undefined,
  };
}

export const NotificationModel = {
  async create(
    notificationData: Omit<NotificationDTO, "id">
  ): Promise<NotificationDTO> {
    const createdNotification = await prisma.notification.create({
      data: {
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        isRead: notificationData.isRead,
        relatedId: notificationData.relatedId,
        actionUrl: notificationData.actionUrl,
        createdAt: notificationData.createdAt,
      },
    });

    return toDTO(createdNotification);
  },

  async getById(id: number): Promise<NotificationDTO | null> {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) return null;
    return toDTO(notification);
  },

  async getByUserId(userId: number): Promise<NotificationDTO[]> {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return notifications.map(toDTO);
  },

  async getUnreadCount(userId: number): Promise<number> {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  },

  async markAsRead(id: number): Promise<NotificationDTO> {
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return toDTO(updatedNotification);
  },

  async markAllAsRead(userId: number): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  },

  async delete(id: number): Promise<void> {
    await prisma.notification.delete({
      where: { id },
    });
  },

  async deleteOldNotifications(days: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  },
};
