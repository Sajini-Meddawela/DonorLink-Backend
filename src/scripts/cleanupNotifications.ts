import { NotificationService } from "../services/notification.service";

export async function cleanupOldNotifications() {
  try {
    await NotificationService.cleanupOldNotifications();
  } catch (error) {
    console.error("Error during notification cleanup:", error);
  }
}

export function scheduleCleanup() {
  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(2, 0, 0, 0);

  if (now > targetTime) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const timeUntilCleanup = targetTime.getTime() - now.getTime();

  setTimeout(() => {
    cleanupOldNotifications();
    setInterval(cleanupOldNotifications, 24 * 60 * 60 * 1000);
  }, timeUntilCleanup);
}
