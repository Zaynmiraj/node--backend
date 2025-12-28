import { Response } from 'express';
import { AuthRequest } from '../types';
import roleService from '../services/role.service';
import { sendSuccess } from '../helpers/response.helper';
import { asyncHandler } from '../middleware/error.middleware';

/**
 * Create a new role
 */
export const createRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const role = await roleService.create(req.body);
  sendSuccess(res, role, 'Role created successfully', 201);
});

/**
 * Get role by ID
 */
export const getRoleById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const role = await roleService.getById(req.params.id);
  sendSuccess(res, role, 'Role retrieved successfully');
});

/**
 * Get all roles
 */
export const getAllRoles = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = req.query;

  const result = await roleService.getAll({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  });

  sendSuccess(res, result, 'Roles retrieved successfully');
});

/**
 * Update role
 */
export const updateRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const role = await roleService.update(req.params.id, req.body);
  sendSuccess(res, role, 'Role updated successfully');
});

/**
 * Delete role
 */
export const deleteRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await roleService.delete(req.params.id);
  sendSuccess(res, result, 'Role deleted successfully');
});

/**
 * Set role as default
 */
export const setDefaultRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const role = await roleService.setDefault(req.params.id);
  sendSuccess(res, role, 'Default role updated successfully');
});
