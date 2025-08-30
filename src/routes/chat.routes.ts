import { Router } from "express";
import { ChatController, upload } from "../controllers/chat.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/chats", ChatController.getOrCreateChat);
router.get("/chats", ChatController.getUserChats);
router.get("/chats/:chatId/messages", ChatController.getChatMessages);
router.post("/chats/message", ChatController.sendMessage);
router.get("/chats/unread-count", ChatController.getUnreadCount);
router.post("/chats/mark-read", ChatController.markMessagesAsRead);
router.get("/chats/unread-chat-count", ChatController.getUnreadChatCount);
router.get("/chats/chat-unread-counts", ChatController.getChatUnreadCounts);
router.post("/chats/upload", upload.single('file'), ChatController.uploadFile);

export default router;