import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate, authorizeType } from '../middleware/auth.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();

// All dashboard routes require admin authentication
router.use(authenticate, authorizeType('admin'));

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 */
router.get('/stats', cacheMiddleware(300), dashboardController.getStats);

/**
 * @swagger
 * /api/dashboard/user-growth:
 *   get:
 *     summary: Get user growth data (last 7 days)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User growth data retrieved
 */
router.get('/user-growth', cacheMiddleware(600), dashboardController.getUserGrowth);

/**
 * @swagger
 * /api/dashboard/role-distribution:
 *   get:
 *     summary: Get user role distribution
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Role distribution data retrieved
 */
router.get('/role-distribution', cacheMiddleware(600), dashboardController.getRoleDistribution);

/**
 * @swagger
 * /api/dashboard/recent-users:
 *   get:
 *     summary: Get recent users
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of recent users to return
 *     responses:
 *       200:
 *         description: Recent users retrieved
 */
router.get('/recent-users', cacheMiddleware(120), dashboardController.getRecentUsers);

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get system overview (all dashboard data)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: System overview retrieved
 */
router.get('/overview', cacheMiddleware(300), dashboardController.getSystemOverview);

export default router;
