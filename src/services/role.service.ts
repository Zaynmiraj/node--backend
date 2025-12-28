import prisma from '../lib/prisma';
import { CreateRoleDto, UpdateRoleDto, PaginationParams } from '../types';
import { ApiError } from '../middleware/error.middleware';
import cacheService from './cache.service';

class RoleService {
  /**
   * Create a new role
   */
  async create(data: CreateRoleDto) {
    // Check if role with same name or slug exists
    const existingRole = await prisma.role.findFirst({
      where: {
        OR: [{ name: data.name }, { slug: data.slug }],
      },
    });

    if (existingRole) {
      throw new ApiError('Role with this name or slug already exists', 400);
    }

    const role = await prisma.role.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        permissions: data.permissions ? JSON.stringify(data.permissions) : null,
        isDefault: data.isDefault || false,
      },
    });

    // Clear roles cache
    await cacheService.deletePattern('roles:*');

    return {
      ...role,
      permissions: role.permissions ? JSON.parse(role.permissions) : [],
    };
  }

  /**
   * Get role by ID
   */
  async getById(id: string) {
    const cacheKey = `role:${id}`;

    return cacheService.getOrSet(cacheKey, async () => {
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          _count: {
            select: { users: true },
          },
        },
      });

      if (!role) {
        throw new ApiError('Role not found', 404);
      }

      return {
        ...role,
        permissions: role.permissions ? JSON.parse(role.permissions) : [],
        userCount: role._count.users,
      };
    });
  }

  /**
   * Get role by slug
   */
  async getBySlug(slug: string) {
    const role = await prisma.role.findUnique({
      where: { slug },
    });

    if (!role) {
      throw new ApiError('Role not found', 404);
    }

    return {
      ...role,
      permissions: role.permissions ? JSON.parse(role.permissions) : [],
    };
  }

  /**
   * Get default role
   */
  async getDefaultRole() {
    const role = await prisma.role.findFirst({
      where: { isDefault: true, isActive: true },
    });

    return role;
  }

  /**
   * Get all roles with pagination
   */
  async getAll(params: PaginationParams) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { users: true },
          },
        },
      }),
      prisma.role.count(),
    ]);

    return {
      roles: roles.map((role) => ({
        ...role,
        permissions: role.permissions ? JSON.parse(role.permissions) : [],
        userCount: role._count.users,
      })),
      total,
      page,
      limit,
    };
  }

  /**
   * Update role
   */
  async update(id: string, data: UpdateRoleDto) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.permissions) {
      updateData.permissions = JSON.stringify(data.permissions);
    }

    const role = await prisma.role.update({
      where: { id },
      data: updateData,
    });

    // Clear role cache
    await cacheService.delete(`role:${id}`);
    await cacheService.deletePattern('roles:*');

    return {
      ...role,
      permissions: role.permissions ? JSON.parse(role.permissions) : [],
    };
  }

  /**
   * Delete role
   */
  async delete(id: string) {
    // Check if role has users
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new ApiError('Role not found', 404);
    }

    if (role._count.users > 0) {
      throw new ApiError('Cannot delete role with assigned users', 400);
    }

    await prisma.role.delete({
      where: { id },
    });

    // Clear role cache
    await cacheService.delete(`role:${id}`);
    await cacheService.deletePattern('roles:*');

    return { message: 'Role deleted successfully' };
  }

  /**
   * Set default role
   */
  async setDefault(id: string) {
    // Unset current default
    await prisma.role.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });

    // Set new default
    const role = await prisma.role.update({
      where: { id },
      data: { isDefault: true },
    });

    await cacheService.deletePattern('roles:*');

    return role;
  }
}

export const roleService = new RoleService();
export default roleService;
