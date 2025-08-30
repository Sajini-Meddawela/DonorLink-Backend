import { NotificationDTO, NotificationModel } from "../models/notification.model";
import { io } from "../server";

export class NotificationService {
  static async createNotification(
    notificationData: Omit<NotificationDTO, "id">
  ): Promise<NotificationDTO> {
    const notification = await NotificationModel.create(notificationData);
    
    io.to(`user_${notification.userId}`).emit('new_notification', notification);
    
    return notification;
  }

  static async getUserNotifications(userId: number): Promise<NotificationDTO[]> {
    return NotificationModel.getByUserId(userId);
  }

  static async getUnreadCount(userId: number): Promise<number> {
    return NotificationModel.getUnreadCount(userId);
  }

  static async markAsRead(notificationId: number): Promise<NotificationDTO> {
    return NotificationModel.markAsRead(notificationId);
  }

  static async markAllAsRead(userId: number): Promise<void> {
    await NotificationModel.markAllAsRead(userId);
    
    // Emit update to the user
    io.to(`user_${userId}`).emit('notifications_read');
  }

  static async deleteNotification(notificationId: number): Promise<void> {
    await NotificationModel.delete(notificationId);
  }

  static async cleanupOldNotifications(): Promise<void> {
    await NotificationModel.deleteOldNotifications(30);
  }

  // Specific notification creators
  static async createLowStockNotification(
    userId: number,
    itemName: string,
    stockLevel: number,
    reorderLevel: number,
    unit: string,
    itemId: number
  ): Promise<NotificationDTO> {
    return this.createNotification({
      userId,
      type: 'LOW_STOCK',
      title: 'Low Stock Alert',
      message: `${itemName} is below reorder level. Current stock: ${stockLevel} ${unit}, Reorder level: ${reorderLevel} ${unit}`,
      isRead: false,
      relatedId: itemId,
      actionUrl: '/inventory',
      createdAt: new Date(),
    });
  }

  static async createNewDonationNotification(
    userId: number,
    itemName: string,
    quantity: number,
    unit: string,
    donationId: number
  ): Promise<NotificationDTO> {
    return this.createNotification({
      userId,
      type: 'NEW_DONATION',
      title: 'New Donation Received',
      message: `New donation of ${quantity} ${unit} of ${itemName}`,
      isRead: false,
      relatedId: donationId,
      actionUrl: '/donations/received',
      createdAt: new Date(),
    });
  }

  static async createDonationStatusNotification(
    userId: number,
    itemName: string,
    quantity: number,
    unit: string,
    status: string,
    donationId: number
  ): Promise<NotificationDTO> {
    const statusText = status === 'completed' ? 'completed' : 'rejected';
    return this.createNotification({
      userId,
      type: 'DONATION_STATUS',
      title: `Donation ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
      message: `Your donation of ${quantity} ${unit} of ${itemName} has been ${statusText}`,
      isRead: false,
      relatedId: donationId,
      actionUrl: `/donation-receipt/${donationId}`,
      createdAt: new Date(),
    });
  }

  static async createMealBookingNotification(
    userId: number,
    mealType: string,
    date: string,
    slotId: number
  ): Promise<NotificationDTO> {
    return this.createNotification({
      userId,
      type: 'MEAL_BOOKING',
      title: 'Meal Booking Confirmation',
      message: `Your ${mealType} meal donation on ${date} has been confirmed`,
      isRead: false,
      relatedId: slotId,
      actionUrl: '/meal-donations',
      createdAt: new Date(),
    });
  }

  static async createSystemNotification(
    userId: number,
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<NotificationDTO> {
    return this.createNotification({
      userId,
      type: 'SYSTEM',
      title,
      message,
      isRead: false,
      actionUrl,
      createdAt: new Date(),
    });
  }
}