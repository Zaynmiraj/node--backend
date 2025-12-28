/**
 * Socket.io event name constants
 */
export const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // User events
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  USER_UPDATED: 'user:updated',

  // Admin events
  ADMIN_JOINED: 'admin:joined',
  ADMIN_LEFT: 'admin:left',
  ADMIN_BROADCAST: 'admin:broadcast',

  // Dashboard events
  DASHBOARD_STATS_UPDATE: 'dashboard:stats:update',
  DASHBOARD_USER_COUNT: 'dashboard:user:count',
  DASHBOARD_REFRESH: 'dashboard:refresh',

  // Notification events
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',

  // Room events
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  ROOM_MESSAGE: 'room:message',
};

export default SOCKET_EVENTS;
