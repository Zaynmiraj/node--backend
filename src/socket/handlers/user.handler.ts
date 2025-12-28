import { Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../events';

/**
 * Handle user socket events
 */
export const userHandler = (socket: Socket) => {
  const userId = socket.data.user?.id;

  // User joined
  console.log(`User connected: ${userId || socket.id}`);

  // Join user-specific room
  if (userId) {
    socket.join(`user:${userId}`);
  }

  // Handle user update
  socket.on(SOCKET_EVENTS.USER_UPDATED, (data) => {
    console.log('User updated:', data);
    // Broadcast to admins
    socket.to('admins').emit(SOCKET_EVENTS.USER_UPDATED, data);
  });

  // Handle joining a room
  socket.on(SOCKET_EVENTS.JOIN_ROOM, (roomId: string) => {
    socket.join(roomId);
    socket.emit(SOCKET_EVENTS.JOIN_ROOM, { room: roomId, joined: true });
  });

  // Handle leaving a room
  socket.on(SOCKET_EVENTS.LEAVE_ROOM, (roomId: string) => {
    socket.leave(roomId);
    socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { room: roomId, left: true });
  });

  // Handle room messages
  socket.on(SOCKET_EVENTS.ROOM_MESSAGE, (data: { room: string; message: string }) => {
    socket.to(data.room).emit(SOCKET_EVENTS.ROOM_MESSAGE, {
      from: userId || socket.id,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle disconnect
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log(`User disconnected: ${userId || socket.id}`);
  });
};

export default userHandler;
