import prisma from '../lib/prisma';
import { DashboardStats } from '../types';
import cacheService from './cache.service';

class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const cacheKey = 'dashboard:stats';

    return cacheService.getOrSet(
      cacheKey,
      async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalUsers, totalAdmins, totalRoles, activeUsers, newUsersToday] = await Promise.all([
          prisma.user.count(),
          prisma.admin.count(),
          prisma.role.count(),
          prisma.user.count({ where: { isActive: true } }),
          prisma.user.count({
            where: {
              createdAt: { gte: today },
            },
          }),
        ]);

        return {
          totalUsers,
          totalAdmins,
          totalRoles,
          activeUsers,
          newUsersToday,
        };
      },
      300 // Cache for 5 minutes
    );
  }

  /**
   * Get user growth data (last 7 days)
   */
  async getUserGrowth() {
    const cacheKey = 'dashboard:user-growth';

    return cacheService.getOrSet(
      cacheKey,
      async () => {
        const days = 7;
        const result = [];

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);

          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          const count = await prisma.user.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDate,
              },
            },
          });

          result.push({
            date: date.toISOString().split('T')[0],
            count,
          });
        }

        return result;
      },
      600 // Cache for 10 minutes
    );
  }

  /**
   * Get user role distribution
   */
  async getUserRoleDistribution() {
    const cacheKey = 'dashboard:role-distribution';

    return cacheService.getOrSet(
      cacheKey,
      async () => {
        const roles = await prisma.role.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: { users: true },
            },
          },
        });

        return roles.map((role) => ({
          id: role.id,
          name: role.name,
          slug: role.slug,
          count: role._count.users,
        }));
      },
      600
    );
  }

  /**
   * Get recent users
   */
  async getRecentUsers(limit: number = 5) {
    const cacheKey = `dashboard:recent-users:${limit}`;

    return cacheService.getOrSet(
      cacheKey,
      async () => {
        return prisma.user.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
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
            createdAt: true,
          },
        });
      },
      120 // Cache for 2 minutes
    );
  }

  /**
   * Get system overview
   */
  async getSystemOverview() {
    const cacheKey = 'dashboard:system-overview';

    return cacheService.getOrSet(
      cacheKey,
      async () => {
        const [stats, userGrowth, roleDistribution, recentUsers] = await Promise.all([
          this.getStats(),
          this.getUserGrowth(),
          this.getUserRoleDistribution(),
          this.getRecentUsers(),
        ]);

        return {
          stats,
          userGrowth,
          roleDistribution,
          recentUsers,
        };
      },
      300
    );
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
