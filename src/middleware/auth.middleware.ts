import { Response, NextFunction } from 'express';
import { AuthRequest, JwtPayload } from '../types';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt.util';
import { sendUnauthorized, sendForbidden } from '../helpers/response.helper';
import { config } from '../config';
import prisma from '../lib/prisma';

/**
 * Authenticate user via JWT token
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    sendUnauthorized(res, 'Access token is required');
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    sendUnauthorized(res, 'Invalid or expired token');
    return;
  }

  req.user = decoded;
  next();
};

/**
 * Authenticate via API Key (alternative to JWT)
 * API Key should be sent in X-API-Key header
 */
export const authenticateApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    sendUnauthorized(res, 'API key is required');
    return;
  }

  // Verify API key against config or database
  // Option 1: Check against environment variable (for simple use)
  if (config.apiKey && apiKey === config.apiKey) {
    // Set a system user for API key access
    req.user = {
      id: 'system',
      email: 'api@system.local',
      role: 'api',
      type: 'admin',
    };
    next();
    return;
  }

  // Option 2: Check against database (for per-client API keys)
  try {
    const session = await prisma.session.findFirst({
      where: {
        token: apiKey,
        expiresAt: { gte: new Date() },
      },
    });

    if (session) {
      req.user = {
        id: session.userId,
        email: 'api-user',
        role: 'api',
        type: session.userType as 'user' | 'admin',
      };
      next();
      return;
    }
  } catch (error) {
    console.error('API Key validation error:', error);
  }

  sendUnauthorized(res, 'Invalid API key');
};

/**
 * Multi-auth: Accept either JWT token OR API Key
 * Tries JWT first, then falls back to API Key
 */
export const multiAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Try JWT first
  const token = extractTokenFromHeader(req.headers.authorization);
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      next();
      return;
    }
  }

  // Try API Key
  const apiKey = req.headers['x-api-key'] as string;
  if (apiKey) {
    // Check config API key
    if (config.apiKey && apiKey === config.apiKey) {
      req.user = {
        id: 'system',
        email: 'api@system.local',
        role: 'api',
        type: 'admin',
      };
      next();
      return;
    }

    // Check database for valid session/API key
    try {
      const session = await prisma.session.findFirst({
        where: {
          token: apiKey,
          expiresAt: { gte: new Date() },
        },
      });

      if (session) {
        req.user = {
          id: session.userId,
          email: 'api-user',
          role: 'api',
          type: session.userType as 'user' | 'admin',
        };
        next();
        return;
      }
    } catch (error) {
      console.error('API Key validation error:', error);
    }
  }

  sendUnauthorized(res, 'Authentication required. Provide JWT token or API key');
};

/**
 * Authorize based on user type
 */
export const authorizeType = (...allowedTypes: Array<'user' | 'admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    if (!allowedTypes.includes(req.user.type)) {
      sendForbidden(res, 'You do not have permission to access this resource');
      return;
    }

    next();
  };
};

/**
 * Authorize based on user role
 */
export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendForbidden(res, 'You do not have permission to access this resource');
      return;
    }

    next();
  };
};

/**
 * Authorize based on permissions (from role)
 */
export const authorizePermission = (...requiredPermissions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    // API key users bypass permission checks (or you can customize this)
    if (req.user.role === 'api') {
      next();
      return;
    }

    try {
      // Get user's role and permissions
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          role: {
            select: { permissions: true },
          },
        },
      });

      if (!user) {
        sendUnauthorized(res, 'User not found');
        return;
      }

      const permissions = user.role.permissions
        ? JSON.parse(user.role.permissions)
        : [];

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every((perm) =>
        permissions.includes(perm)
      );

      if (!hasAllPermissions) {
        sendForbidden(res, 'Insufficient permissions');
        return;
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      sendForbidden(res, 'Permission check failed');
    }
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};
