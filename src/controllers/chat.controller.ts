import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images and documents are allowed"));
    }
  },
});

export class ChatController {
  static async getOrCreateChat(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { careHomeId } = req.body;

      if (!userId || !careHomeId) {
        return res
          .status(400)
          .json({ error: "User ID and CareHome ID are required" });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.role !== "DONOR") {
        return res
          .status(403)
          .json({ error: "Only donors can initiate chats" });
      }

      const careHome = await prisma.user.findUnique({
        where: { id: careHomeId, role: "CAREHOME" },
      });

      if (!careHome) {
        return res.status(404).json({ error: "CareHome not found" });
      }

      const hasDonated = await prisma.donation.findFirst({
        where: {
          donorId: userId,
          need: {
            userId: careHomeId,
          },
        },
      });

      if (!hasDonated) {
        return res.status(403).json({
          error: "You can only chat with carehomes you've donated to",
        });
      }

      let chat = await prisma.chat.findFirst({
        where: {
          donorId: userId,
          careHomeId: careHomeId,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 20,
          },
        },
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: {
            donorId: userId,
            careHomeId: careHomeId,
          },
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
            },
          },
        });
      }

      res.status(200).json(chat);
    } catch (error) {
      console.error("Error in getOrCreateChat:", error);
      res.status(500).json({ error: "Failed to get or create chat" });
    }
  }

  static async getUserChats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let chats;

      if (user.role === "DONOR") {
        const donations = await prisma.donation.findMany({
          where: { donorId: userId },
          include: {
            need: {
              include: {
                user: true,
              },
            },
          },
        });

        const careHomeIds = Array.from(
          new Set(donations.map((d) => d.need.userId))
        );

        chats = await Promise.all(
          careHomeIds.map(async (careHomeId) => {
            let chat = await prisma.chat.findFirst({
              where: {
                donorId: userId,
                careHomeId: careHomeId,
              },
              include: {
                careHome: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                messages: {
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
                _count: {
                  select: {
                    messages: {
                      where: {
                        read: false,
                        senderId: { not: userId },
                      },
                    },
                  },
                },
              },
            });

            if (!chat) {
              chat = await prisma.chat.create({
                data: {
                  donorId: userId,
                  careHomeId: careHomeId,
                },
                include: {
                  careHome: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                  messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                  },
                  _count: {
                    select: {
                      messages: {
                        where: {
                          read: false,
                          senderId: { not: userId },
                        },
                      },
                    },
                  },
                },
              });
            }

            // Add unreadCount to the chat object
            return { ...chat, unreadCount: chat._count.messages };
          })
        );
      } else if (user.role === "CAREHOME") {
        const donations = await prisma.donation.findMany({
          where: {
            need: {
              userId: userId,
            },
          },
          include: {
            donor: true,
          },
        });

        const donorIds = Array.from(new Set(donations.map((d) => d.donorId)));

        chats = await Promise.all(
          donorIds.map(async (donorId) => {
            let chat = await prisma.chat.findFirst({
              where: {
                careHomeId: userId,
                donorId: donorId,
              },
              include: {
                donor: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                messages: {
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
                _count: {
                  select: {
                    messages: {
                      where: {
                        read: false,
                        senderId: { not: userId },
                      },
                    },
                  },
                },
              },
            });

            if (!chat) {
              chat = await prisma.chat.create({
                data: {
                  careHomeId: userId,
                  donorId: donorId,
                },
                include: {
                  donor: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                  messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                  },
                  _count: {
                    select: {
                      messages: {
                        where: {
                          read: false,
                          senderId: { not: userId },
                        },
                      },
                    },
                  },
                },
              });
            }

            // Add unreadCount to the chat object
            return { ...chat, unreadCount: chat._count.messages };
          })
        );
      } else {
        return res.status(403).json({ error: "Unauthorized user role" });
      }

      chats.sort((a, b) => {
        const dateA = a.messages[0]?.createdAt || a.createdAt;
        const dateB = b.messages[0]?.createdAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      res.status(200).json(chats);
    } catch (error) {
      console.error("Error in getUserChats:", error);
      res.status(500).json({ error: "Failed to get user chats" });
    }
  }

  static async getChatMessages(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const chatId = parseInt(req.params.chatId);

      if (!userId || isNaN(chatId)) {
        return res
          .status(400)
          .json({ error: "User ID and valid Chat ID are required" });
      }

      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          OR: [{ donorId: userId }, { careHomeId: userId }],
        },
      });

      if (!chat) {
        return res
          .status(404)
          .json({ error: "Chat not found or access denied" });
      }

      const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      await prisma.message.updateMany({
        where: {
          chatId,
          senderId: { not: userId },
          read: false,
        },
        data: { read: true },
      });

      res.status(200).json(messages);
    } catch (error) {
      console.error("Error in getChatMessages:", error);
      res.status(500).json({ error: "Failed to get chat messages" });
    }
  }

  static async sendMessage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const {
        chatId,
        content,
        messageType,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
      } = req.body;

      if (!userId || !chatId) {
        return res
          .status(400)
          .json({ error: "User ID and Chat ID are required" });
      }

      // For text messages, content is required
      if ((!messageType || messageType === "TEXT") && !content) {
        return res
          .status(400)
          .json({ error: "Content is required for text messages" });
      }

      // For file messages, fileUrl is required
      if (messageType !== "TEXT" && !fileUrl) {
        return res
          .status(400)
          .json({ error: "File URL is required for file messages" });
      }

      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          OR: [{ donorId: userId }, { careHomeId: userId }],
        },
      });

      if (!chat) {
        return res
          .status(404)
          .json({ error: "Chat not found or access denied" });
      }

      const message = await prisma.message.create({
        data: {
          content: content || fileName || "File",
          senderId: userId,
          chatId: chatId,
          messageType: messageType || "TEXT",
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          fileSize: fileSize || null,
          mimeType: mimeType || null,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });

      res.status(201).json(message);

      if (req.app.get("io")) {
        const io = req.app.get("io");
        io.to(`chat_${chatId}`).emit("new_message", message);
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  }

  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const unreadCount = await prisma.message.count({
        where: {
          chat: {
            OR: [{ donorId: userId }, { careHomeId: userId }],
          },
          senderId: { not: userId },
          read: false,
        },
      });

      res.status(200).json(unreadCount);
    } catch (error) {
      console.error("Error in getUnreadCount:", error);
      res.status(500).json({ error: "Failed to get unread count" });
    }
  }

  static async getChatUnreadCounts(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const chats = await prisma.chat.findMany({
        where: {
          OR: [{ donorId: userId }, { careHomeId: userId }],
        },
        include: {
          messages: {
            where: {
              read: false,
              senderId: { not: userId }, // Only count messages not sent by the current user
            },
          },
        },
      });

      const chatUnreadCounts = chats.map((chat) => ({
        chatId: chat.id,
        unreadCount: chat.messages.length,
      }));

      res.status(200).json(chatUnreadCounts);
    } catch (error) {
      console.error("Error in getChatUnreadCounts:", error);
      res.status(500).json({ error: "Failed to get chat unread counts" });
    }
  }

  static async getUnreadChatCount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const chatsWithUnread = await prisma.chat.findMany({
        where: {
          OR: [{ donorId: userId }, { careHomeId: userId }],
          messages: {
            some: {
              read: false,
              senderId: { not: userId },
            },
          },
        },
      });

      res.status(200).json(chatsWithUnread.length);
    } catch (error) {
      console.error("Error in getUnreadChatCount:", error);
      res.status(500).json({ error: "Failed to get unread chat count" });
    }
  }

  static async markMessagesAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { chatId } = req.body;

      if (!userId || !chatId) {
        return res
          .status(400)
          .json({ error: "User ID and Chat ID are required" });
      }

      await prisma.message.updateMany({
        where: {
          chatId,
          senderId: { not: userId },
          read: false,
        },
        data: { read: true },
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error in markMessagesAsRead:", error);
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  }

  static async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.status(200).json({
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  }
}
