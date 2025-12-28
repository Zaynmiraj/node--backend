import { Response } from 'express';
import { AuthRequest } from '../types';
import adminService from '../services/admin.service';
import { sendSuccess, sendError } from '../helpers/response.helper';
import { asyncHandler } from '../middleware/error.middleware';

/**
 * Register a new admin
 */
export const createAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const admin = await adminService.create(req.body);
  sendSuccess(res, admin, 'Admin created successfully', 201);
});

/**
 * Login admin
 */
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await adminService.login(req.body);
  sendSuccess(res, result, 'Login successful');
});

/**
 * Get current admin profile
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const admin = await adminService.getById(req.user.id);
  sendSuccess(res, admin, 'Profile retrieved successfully');
});

/**
 * Update current admin profile
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const admin = await adminService.update(req.user.id, req.body);
  sendSuccess(res, admin, 'Profile updated successfully');
});

/**
 * Get admin by ID
 */
export const getAdminById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const admin = await adminService.getById(req.params.id);
  sendSuccess(res, admin, 'Admin retrieved successfully');
});

/**
 * Get all admins
 */
export const getAllAdmins = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = req.query;
  
  const result = await adminService.getAll({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  });

  sendSuccess(res, result, 'Admins retrieved successfully');
});

/**
 * Delete admin
 */
export const deleteAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await adminService.delete(req.params.id);
  sendSuccess(res, result, 'Admin deleted successfully');
});

/**
 * Get all users (for admin management)
 */
export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = req.query;
  
  const result = await adminService.getAllUsers({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  });

  sendSuccess(res, result, 'Users retrieved successfully');
});

/**
 * Toggle user status
 */
export const toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await adminService.toggleUserStatus(req.params.id);
  sendSuccess(res, result, 'User status updated successfully');
});
