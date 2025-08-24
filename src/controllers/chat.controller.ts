import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

export class ChatController {
  static async getOrCreateChat(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { careHomeId } = req.body;

      if (!userId || !careHomeId) {
        return res.status(400).json({ error: "User ID and CareHome ID are required" });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.role !== "DONOR") {
        return res.status(403).json({ error: "Only donors can initiate chats" });
      }

      const careHome = await prisma.user.findUnique({
        where: { id: careHomeId, role: "CAREHOME" }
      });
      
      if (!careHome) {
        return res.status(404).json({ error: "CareHome not found" });
      }

      const hasDonated = await prisma.donation.findFirst({
        where: {
          donorId: userId,
          need: {
            userId: careHomeId
          }
        }
      });

      if (!hasDonated) {
        return res.status(403).json({ error: "You can only chat with carehomes you've donated to" });
      }

      let chat = await prisma.chat.findFirst({
        where: {
          donorId: userId,
          careHomeId: careHomeId
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 20 
          }
        }
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: {
            donorId: userId,
            careHomeId: careHomeId
          },
          include: {
            messages: {
              orderBy: { createdAt: "asc" }
            }
          }
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
                user: true
              }
            }
          }
        });

        const careHomeIds = Array.from(new Set(donations.map(d => d.need.userId)));
        
        chats = await Promise.all(
          careHomeIds.map(async (careHomeId) => {
            let chat = await prisma.chat.findFirst({
              where: {
                donorId: userId,
                careHomeId: careHomeId
              },
              include: {
                careHome: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                },
                messages: {
                  orderBy: { createdAt: "desc" },
                  take: 1
                }
              }
            });

            if (!chat) {
              chat = await prisma.chat.create({
                data: {
                  donorId: userId,
                  careHomeId: careHomeId
                },
                include: {
                  careHome: {
                    select: {
                      id: true,
                      name: true,
                      email: true
                    }
                  },
                  messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                  }
                }
              });
            }

            return chat;
          })
        );
        
      } else if (user.role === "CAREHOME") {
        const donations = await prisma.donation.findMany({
          where: {
            need: {
              userId: userId
            }
          },
          include: {
            donor: true
          }
        });

        const donorIds = Array.from(new Set(donations.map(d => d.donorId)));
        
        chats = await Promise.all(
          donorIds.map(async (donorId) => {
            let chat = await prisma.chat.findFirst({
              where: {
                careHomeId: userId,
                donorId: donorId
              },
              include: {
                donor: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                },
                messages: {
                  orderBy: { createdAt: "desc" },
                  take: 1
                }
              }
            });

            if (!chat) {
              chat = await prisma.chat.create({
                data: {
                  careHomeId: userId,
                  donorId: donorId
                },
                include: {
                  donor: {
                    select: {
                      id: true,
                      name: true,
                      email: true
                    }
                  },
                  messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                  }
                }
              });
            }

            return chat;
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
        return res.status(400).json({ error: "User ID and valid Chat ID are required" });
      }

      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          OR: [
            { donorId: userId },
            { careHomeId: userId }
          ]
        }
      });

      if (!chat) {
        return res.status(404).json({ error: "Chat not found or access denied" });
      }

      const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        }
      });

      await prisma.message.updateMany({
        where: {
          chatId,
          senderId: { not: userId },
          read: false
        },
        data: { read: true }
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
      const { chatId, content } = req.body;
      
      if (!userId || !chatId || !content) {
        return res.status(400).json({ error: "User ID, Chat ID, and content are required" });
      }

      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          OR: [
            { donorId: userId },
            { careHomeId: userId }
          ]
        }
      });

      if (!chat) {
        return res.status(404).json({ error: "Chat not found or access denied" });
      }

      const message = await prisma.message.create({
        data: {
          content,
          senderId: userId,
          chatId: chatId
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        }
      });

      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
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
}