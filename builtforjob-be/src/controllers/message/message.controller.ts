import { Response, NextFunction } from 'express';
import prisma from '../../config/database/db';
import { AuthRequest } from '../../middlewares/auth/jwt.middleware';
import { emitToUser } from '../../config/socket/socket.config';

export class MessageController {

  // Get recent chats for inbox
  static async getInbox(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const currentUserId = req.user!.userId;
      // We want to group by user we are chatting with and get the latest message
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUserId },
            { receiverId: currentUserId }
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, jobTitle: true } },
          receiver: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, jobTitle: true } },
        }
      });

      // Deduplicate to get the latest message per conversation
      const convos = new Map<string, any>();
      messages.forEach(msg => {
        const otherUser = msg.senderId === currentUserId ? msg.receiver : msg.sender;
        if (!convos.has(otherUser.id)) {
          convos.set(otherUser.id, {
            otherUser,
            latestMessage: msg,
            unreadCount: (msg.receiverId === currentUserId && !msg.isRead) ? 1 : 0
          });
        } else {
          // just increment unread if applicable
          if (msg.receiverId === currentUserId && !msg.isRead) {
             const existing = convos.get(otherUser.id);
             existing.unreadCount += 1;
          }
        }
      });

      return res.json({ success: true, data: Array.from(convos.values()) });
    } catch (error) {
      next(error);
    }
  }

  // Get chat history with a specific user
  static async getChatHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const currentUserId = req.user!.userId;
      const otherUserId = req.params.userId;

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: currentUserId }
          ]
        },
        orderBy: { createdAt: 'asc' },
      });

      // Mark unread messages as read
      await prisma.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: currentUserId,
          isRead: false
        },
        data: { isRead: true }
      });

      return res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  }

  // System injection of message when an application is accepted
  static async injectSystemMessage(senderId: string, receiverId: string, content: string, contextType: string, contextId: string) {
    try {
      const msg = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          content,
          contextType,
          contextId
        },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
        }
      });

      // Attempt to emit live
      emitToUser(receiverId, 'receiveMessage', msg);
      return msg;
    } catch (err) {
      console.error(err);
    }
  }

}
