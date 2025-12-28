import { Response } from 'express';
import { AuthRequest } from '../types';
import dashboardService from '../services/dashboard.service';
import { sendSuccess } from '../helpers/response.helper';
import { asyncHandler } from '../middleware/error.middleware';

/**
 * Get dashboard statistics
 */
export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await dashboardService.getStats();
  sendSuccess(res, stats, 'Dashboard stats retrieved successfully');
});

/**
 * Get user growth data
 */
export const getUserGrowth = asyncHandler(async (req: AuthRequest, res: Response) => {
  const growth = await dashboardService.getUserGrowth();
  sendSuccess(res, growth, 'User growth data retrieved successfully');
});

/**
 * Get user role distribution
 */
export const getRoleDistribution = asyncHandler(async (req: AuthRequest, res: Response) => {
  const distribution = await dashboardService.getUserRoleDistribution();
  sendSuccess(res, distribution, 'Role distribution retrieved successfully');
});

/**
 * Get recent users
 */
export const getRecentUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = Number(req.query.limit) || 5;
  const users = await dashboardService.getRecentUsers(limit);
  sendSuccess(res, users, 'Recent users retrieved successfully');
});

/**
 * Get system overview
 */
export const getSystemOverview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const overview = await dashboardService.getSystemOverview();
  sendSuccess(res, overview, 'System overview retrieved successfully');
});
