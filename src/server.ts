import { createServer } from 'http';
import app from './app';
import { config } from './config';
import { prisma } from './lib/prisma';
import redis from './lib/redis';
import { initializeSocket } from './socket';

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

// Graceful shutdown handler
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  // Close HTTP server
  httpServer.close(() => {
    console.log('HTTP server closed');
  });

  // Disconnect Prisma
  await prisma.$disconnect();
  console.log('Prisma disconnected');

  // Disconnect Redis
  await redis.disconnect();
  console.log('Redis disconnected');

  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Connect to Database (Prisma)
    await prisma.$connect();
    const dbStatus = '✅ Connected';

    // Connect to Redis
    await redis.connect();
    const redisStatus = redis.isReady() ? '✅ Connected' : '❌ Not Connected';

    // Start listening
    httpServer.listen(config.port, () => {
      console.log(`
╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║   Nimion API Server                                                  ║
║                                                                     ║
║   Environment: ${config.env.padEnd(52)}║
║   Port: ${String(config.port).padEnd(59)}║
║   API URL: http://localhost:${String(config.port).padEnd(39)}║
║                                                                     ║
║   Database (MySQL): ${dbStatus.padEnd(47)}║
║   Redis: ${redisStatus.padEnd(59)}║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
