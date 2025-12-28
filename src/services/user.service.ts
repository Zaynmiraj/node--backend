import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken, generateRefreshToken } from '../utils/jwt.util';
import { CreateUserDto, UpdateUserDto, LoginDto, JwtPayload, PaginationParams } from '../types';
import { ApiError } from '../middleware/error.middleware';
import cacheService from './cache.service';
import roleService from './role.service';

class UserService {
  /**
   * Create a new user
   */
  async create(data: CreateUserDto) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError('User with this email already exists', 400);
    }

    // Get roleId - use provided or get default role
    let roleId = data.roleId;
    if (!roleId) {
      const defaultRole = await roleService.getDefaultRole();
      if (!defaultRole) {
        throw new ApiError('No default role found. Please create a default role first.', 400);
      }
      roleId = defaultRole.id;
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        roleId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdAt: true,
      },
    });

    // Clear users cache
    await cacheService.deletePattern('users:*');

    return user;
  }

  /**
   * Login user
   */
  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
            permissions: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new ApiError('Invalid credentials', 401);
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError('Invalid credentials', 401);
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role.slug,
      roleId: user.role.id,
      type: 'user',
    };

    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Get user by ID
   */
  async getById(id: string) {
    const cacheKey = `user:${id}`;

    return cacheService.getOrSet(cacheKey, async () => {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: {
            select: {
              id: true,
              name: true,
              slug: true,
              permissions: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      return {
        ...user,
        role: {
          ...user.role,
          permissions: user.role.permissions ? JSON.parse(user.role.permissions) : [],
        },
      };
    });
  }

  /**
   * Get all users with pagination
   */
  async getAll(params: PaginationParams) {
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
          role: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return { users, total, page, limit };
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserDto) {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        updatedAt: true,
      },
    });

    // Clear user cache
    await cacheService.delete(`user:${id}`);

    return user;
  }

  /**
   * Delete user
   */
  async delete(id: string) {
    await prisma.user.delete({
      where: { id },
    });

    // Clear user cache
    await cacheService.delete(`user:${id}`);
    await cacheService.deletePattern('users:*');

    return { message: 'User deleted successfully' };
  }

  /**
   * Change user role
   */
  async changeRole(userId: string, roleId: string) {
    // Verify role exists
    await roleService.getById(roleId);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
      select: {
        id: true,
        email: true,
        name: true,
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Clear user cache
    await cacheService.delete(`user:${userId}`);

    return user;
  }
}

export const userService = new UserService();
export default userService;
