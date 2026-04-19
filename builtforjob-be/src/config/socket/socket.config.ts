import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../jwt/jwt.config';
import prisma from '../database/db';

let io: Server;

// Map of userId to their active socket ID
const userSockets = new Map<string, string>();

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*', // For dev, allow all. Hardening in production
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['bearer'];
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token.replace('Bearer ', ''), jwtConfig.secret) as { userId: string; email: string };
      socket.data.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    userSockets.set(userId, socket.id);

    // Initial log
    console.log(`User connected to WS: ${userId} (socket: ${socket.id})`);

    // Handle sending message
    socket.on('sendMessage', async (data: { receiverId: string; content: string, contextType?: string, contextId?: string }) => {
      try {
        const message = await prisma.message.create({
          data: {
            senderId: userId,
            receiverId: data.receiverId,
            content: data.content,
            contextType: data.contextType,
            contextId: data.contextId,
          },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
          }
        });

        // Send to receiver if online
        const receiverSocketId = userSockets.get(data.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', message);
        }

        // Acknowledge back to sender
        socket.emit('messageSent', message);
      } catch (err) {
        console.error('WS sendMessage Error', err);
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data: { receiverId: string }) => {
      const receiverSocketId = userSockets.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', { senderId: userId });
      }
    });

    socket.on('disconnect', () => {
      userSockets.delete(userId);
      console.log(`User disconnected from WS: ${userId}`);
    });
  });

  return io;
};

// Expose a helper to emit events dynamically from standard controllers
export const emitToUser = (userId: string, eventName: string, payload: any) => {
  if (!io) return;
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit(eventName, payload);
  }
};
