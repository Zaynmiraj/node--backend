import { Response } from 'express';
import { AuthRequest} from '../types';
import userService from '../services/user.service';
import { sendSuccess, sendError } from '../helpers/response.helper';
import { asyncHandler } from '../middleware/error.middleware';

/**
 * Register a new user
 */
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.create(req.body);
  sendSuccess(res, user, 'User registered successfully', 201);
});

/**
 * Login user
 */
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await userService.login(req.body);
  sendSuccess(res, result, 'Login successful');
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const user = await userService.getById(req.user.id);
  sendSuccess(res, user, 'Profile retrieved successfully');
});

/**
 * Update current user profile
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const user = await userService.update(req.user.id, req.body);
  sendSuccess(res, user, 'Profile updated successfully');
});

/**
 * Get user by ID (admin only)
 */
export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.getById(req.params.id);
  sendSuccess(res, user, 'User retrieved successfully');
});

/**
 * Get all users (admin only)
 */
export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = req.query;
  
  const result = await userService.getAll({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  });

  sendSuccess(res, result, 'Users retrieved successfully');
});

/**
 * Delete user (admin only)
 */
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await userService.delete(req.params.id);
  sendSuccess(res, result, 'User deleted successfully');
});
