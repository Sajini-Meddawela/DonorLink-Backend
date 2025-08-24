import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/chats", ChatController.getOrCreateChat);
router.get("/chats", ChatController.getUserChats);
router.get("/chats/:chatId/messages", ChatController.getChatMessages);
router.post("/chats/message", ChatController.sendMessage);

export default router;