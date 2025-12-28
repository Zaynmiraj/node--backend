import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { config } from '../config';
import { verifyToken } from '../utils/jwt.util';
import { JwtPayload } from '../types';
import { userHandler } from './handlers/user.handler';
import { adminHandler } from './handlers/admin.handler';
import { dashboardHandler } from './handlers/dashboard.handler';

let io: Server;

/**
 * Initialize Socket.io server
 */
export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        socket.data.user = decoded;
        return next();
      }
    }

    // Allow connection without auth for public features
    // Remove this if all socket connections require auth
    next();
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as JwtPayload | undefined;

    console.log(`Socket connected: ${socket.id}`, user ? `(${user.type}: ${user.id})` : '(anonymous)');

    // Apply handlers based on user type
    if (user) {
      if (user.type === 'admin') {
        adminHandler(socket);
      } else {
        userHandler(socket);
      }
      dashboardHandler(socket);
    } else {
      // Limited functionality for unauthenticated users
      userHandler(socket);
    }

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

/**
 * Get Socket.io instance
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit event to specific user
 */
export const emitToUser = (userId: string, event: string, data: unknown): void => {
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Emit event to specific admin
 */
export const emitToAdmin = (adminId: string, event: string, data: unknown): void => {
  io.to(`admin:${adminId}`).emit(event, data);
};

/**
 * Emit event to all admins
 */
export const emitToAllAdmins = (event: string, data: unknown): void => {
  io.to('admins').emit(event, data);
};

/**
 * Broadcast event to all connected clients
 */
export const broadcast = (event: string, data: unknown): void => {
  io.emit(event, data);
};

export default { initializeSocket, getIO, emitToUser, emitToAdmin, emitToAllAdmins, broadcast };
