import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken, generateRefreshToken } from '../utils/jwt.util';
import { CreateAdminDto, UpdateAdminDto, LoginDto, JwtPayload, PaginationParams } from '../types';
import { ApiError } from '../middleware/error.middleware';
import cacheService from './cache.service';

class AdminService {
  /**
   * Create a new admin
   */
  async create(data: CreateAdminDto) {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: data.email },
    });

    if (existingAdmin) {
      throw new ApiError('Admin with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        ...data,
        password: hashedPassword,
        permissions: data.permissions ? JSON.stringify(data.permissions) : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Clear admins cache
    await cacheService.deletePattern('admins:*');

    return admin;
  }

  /**
   * Login admin
   */
  async login(data: LoginDto) {
    const admin = await prisma.admin.findUnique({
      where: { email: data.email },
    });

    if (!admin || !admin.isActive) {
      throw new ApiError('Invalid credentials', 401);
    }

    const isPasswordValid = await comparePassword(data.password, admin.password);
    if (!isPasswordValid) {
      throw new ApiError('Invalid credentials', 401);
    }

    const payload: JwtPayload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    };

    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Get admin by ID
   */
  async getById(id: string) {
    const cacheKey = `admin:${id}`;
    
    return cacheService.getOrSet(cacheKey, async () => {
      const admin = await prisma.admin.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          permissions: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!admin) {
        throw new ApiError('Admin not found', 404);
      }

      return {
        ...admin,
        permissions: admin.permissions ? JSON.parse(admin.permissions) : [],
      };
    });
  }

  /**
   * Get all admins with pagination
   */
  async getAll(params: PaginationParams) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      prisma.admin.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.admin.count(),
    ]);

    return { admins, total, page, limit };
  }

  /**
   * Update admin
   */
  async update(id: string, data: UpdateAdminDto) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.permissions) {
      updateData.permissions = JSON.stringify(data.permissions);
    }

    const admin = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        permissions: true,
        updatedAt: true,
      },
    });

    // Clear admin cache
    await cacheService.delete(`admin:${id}`);

    return {
      ...admin,
      permissions: admin.permissions ? JSON.parse(admin.permissions) : [],
    };
  }

  /**
   * Delete admin
   */
  async delete(id: string) {
    await prisma.admin.delete({
      where: { id },
    });

    // Clear admin cache
    await cacheService.delete(`admin:${id}`);
    await cacheService.deletePattern('admins:*');

    return { message: 'Admin deleted successfully' };
  }

  /**
   * Get all users (for admin management)
   */
  async getAllUsers(params: PaginationParams) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return { users, total, page, limit };
  }

  /**
   * Toggle user status
   */
  async toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    // Clear user cache
    await cacheService.delete(`user:${userId}`);

    return updatedUser;
  }
}

export const adminService = new AdminService();
export default adminService;
