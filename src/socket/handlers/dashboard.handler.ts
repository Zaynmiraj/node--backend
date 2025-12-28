import { Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../events';
import dashboardService from '../../services/dashboard.service';

/**
 * Handle dashboard socket events
 */
export const dashboardHandler = (socket: Socket) => {
  const userId = socket.data.user?.id;

  // Join dashboard room
  socket.join('dashboard');

  // Request stats update
  socket.on(SOCKET_EVENTS.DASHBOARD_STATS_UPDATE, async () => {
    try {
      const stats = await dashboardService.getStats();
      socket.emit(SOCKET_EVENTS.DASHBOARD_STATS_UPDATE, stats);
    } catch (error) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to fetch dashboard stats' });
    }
  });

  // Request user count
  socket.on(SOCKET_EVENTS.DASHBOARD_USER_COUNT, async () => {
    try {
      const stats = await dashboardService.getStats();
      socket.emit(SOCKET_EVENTS.DASHBOARD_USER_COUNT, {
        total: stats.totalUsers,
        active: stats.activeUsers,
        newToday: stats.newUsersToday,
      });
    } catch (error) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to fetch user count' });
    }
  });
};

/**
 * Broadcast stats update to all dashboard subscribers
 */
export const broadcastStatsUpdate = async (io: any) => {
  try {
    const stats = await dashboardService.getStats();
    io.to('dashboard').emit(SOCKET_EVENTS.DASHBOARD_STATS_UPDATE, stats);
  } catch (error) {
    console.error('Failed to broadcast stats update:', error);
  }
};

export default dashboardHandler;
