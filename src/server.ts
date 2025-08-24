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
import { errorHandler } from "./middleware/error.midleware";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { authenticateSocket } from "./middleware/auth.middleware";

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
