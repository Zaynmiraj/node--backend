import { Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../events';

/**
 * Handle admin socket events
 */
export const adminHandler = (socket: Socket) => {
  const adminId = socket.data.user?.id;

  // Admin joined
  console.log(`Admin connected: ${adminId || socket.id}`);

  // Join admin room
  socket.join('admins');

  // Join admin-specific room
  if (adminId) {
    socket.join(`admin:${adminId}`);
  }

  // Handle broadcast to all users
  socket.on(SOCKET_EVENTS.ADMIN_BROADCAST, (data: { message: string; type?: string }) => {
    socket.broadcast.emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
      from: 'admin',
      message: data.message,
      type: data.type || 'info',
      timestamp: new Date().toISOString(),
    });
  });

  // Handle dashboard refresh request
  socket.on(SOCKET_EVENTS.DASHBOARD_REFRESH, () => {
    // Emit to all admins to refresh their dashboards
    socket.to('admins').emit(SOCKET_EVENTS.DASHBOARD_REFRESH, {
      requestedBy: adminId || socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle disconnect
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log(`Admin disconnected: ${adminId || socket.id}`);
  });
};

export default adminHandler;
