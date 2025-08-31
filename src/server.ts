import express, { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import inventoryRoutes from "./routes/inventory.routes";
import needRoutes from "./routes/need.routes";
import careHomeRoutes from "./routes/carehome.routes";
import mealDonationRoutes from "./routes/mealDonation.routes";
import authRoutes from "./routes/auth.routes";
import donationRoutes from "./routes/donation.routes";
import userRoutes from "./routes/user.routes";
import chatRoutes from "./routes/chat.routes";
import notificationRoutes from "./routes/notification.routes";
import { errorHandler } from "./middleware/error.midleware";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { authenticateSocket } from "./middleware/auth.middleware";
import { NotificationService } from "./services/notification.service";
import { cleanupOldNotifications, scheduleCleanup } from "./scripts/cleanupNotifications";
import path from "path";
import fs from "fs";

dotenv.config();

const prisma = new PrismaClient();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use(authenticateSocket);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = (socket as any).user?.id;

  if (userId) {
    socket.join(`user_${userId}`);
  }

  socket.on("join_chat", (chatId) => {
    socket.join(`chat_${chatId}`);
  });

  socket.on("leave_chat", (chatId) => {
    socket.leave(`chat_${chatId}`);
  });

  socket.on("typing", (data) => {
    const { chatId, userId, isTyping } = data;
    socket.to(`chat_${chatId}`).emit("user_typing", { userId, isTyping });
  });

  socket.on('mark_notification_read', async (data) => {
    try {
      await NotificationService.markAsRead(data.notificationId);
      socket.emit('notification_read', { success: true, notificationId: data.notificationId });
      
      if (userId) {
        const unreadCount = await NotificationService.getUnreadCount(userId);
        io.to(`user_${userId}`).emit('unread_count_update', { count: unreadCount });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      socket.emit('notification_read', { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  socket.on('mark_all_notifications_read', async () => {
    try {
      if (!userId) {
        socket.emit('all_notifications_read', { 
          success: false, 
          error: 'User not authenticated' 
        });
        return;
      }

      await NotificationService.markAllAsRead(userId);
      socket.emit('all_notifications_read', { success: true });
      
      const unreadCount = await NotificationService.getUnreadCount(userId);
      io.to(`user_${userId}`).emit('unread_count_update', { count: unreadCount });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      socket.emit('all_notifications_read', { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  socket.on('get_unread_count', async () => {
    try {
      if (!userId) {
        socket.emit('unread_count', { count: 0 });
        return;
      }

      const count = await NotificationService.getUnreadCount(userId);
      socket.emit('unread_count', { count });
    } catch (error) {
      console.error("Error getting unread count:", error);
      socket.emit('unread_count', { count: 0 });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.set("io", io);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + path.basename(filePath) + '"');
    } else if (ext === '.jpg' || ext === '.jpeg') {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.gif') {
      res.setHeader('Content-Type', 'image/gif');
    } else if (ext === '.doc') {
      res.setHeader('Content-Type', 'application/msword');
      res.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(filePath) + '"');
    } else if (ext === '.docx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(filePath) + '"');
    } else if (ext === '.txt') {
      res.setHeader('Content-Type', 'text/plain');
    }
  }
}));

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/needs", needRoutes);
app.use("/api/mealdonations", mealDonationRoutes);
app.use("/api/carehomes", careHomeRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api", chatRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    await prisma.$connect();
    console.log("Database connected successfully");
    
    // Start the notification cleanup scheduler
    scheduleCleanup();
    
    cleanupOldNotifications();
    
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
});

const shutdown = async () => {
  console.log("Shutting down gracefully...");

  try {
    await prisma.$disconnect();
    console.log("Database connection closed");

    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });

    setTimeout(() => {
      console.error("Forcing shutdown after timeout");
      process.exit(1);
    }, 5000);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  shutdown();
});

export { app, prisma, io };