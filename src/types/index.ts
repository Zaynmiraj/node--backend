import { Request } from 'express';

// User payload in JWT
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  roleId?: string;
  type: 'user' | 'admin';
}

// Extended Express Request with user
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Pagination params
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Role DTOs
export interface CreateRoleDto {
  name: string;
  slug: string;
  description?: string;
  permissions?: string[];
  isDefault?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

// User DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  roleId?: string;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  avatar?: string;
  roleId?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Admin DTOs
export interface CreateAdminDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'ADMIN' | 'SUPER_ADMIN' | 'MODERATOR';
  permissions?: string[];
}

export interface UpdateAdminDto {
  name?: string;
  phone?: string;
  avatar?: string;
  permissions?: string[];
}

// Dashboard types
export interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalRoles: number;
  activeUsers: number;
  newUsersToday: number;
}
