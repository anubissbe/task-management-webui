import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// User interface (compatible with types/index.ts)
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'manager' | 'developer' | 'viewer';
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  workspace_id?: string;
  created_at: Date;
  updated_at: Date;
}

// Extend Express Request to include user and workspace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
      workspaceId?: string;
    }
  }
}

// JWT payload schema
const jwtPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'developer', 'viewer']),
  iat: z.number(),
  exp: z.number()
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

// JWT utilities
export class JwtUtils {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-key-change-in-production';
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production';
  private static readonly ACCESS_TOKEN_EXPIRES = '15m';
  private static readonly REFRESH_TOKEN_EXPIRES = '7d';

  static generateAccessToken(payload: { userId: string; email: string; role: string }): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES
    });
  }

  static generateRefreshToken(payload: { userId: string; email: string; role: string }): string {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES
    });
  }

  static verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET) as any;
      return jwtPayloadSchema.parse(decoded);
    } catch {
      throw new Error('Invalid access token');
    }
  }

  static verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET) as any;
      return jwtPayloadSchema.parse(decoded);
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  static getTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = JwtUtils.getTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    const payload = JwtUtils.verifyAccessToken(token);
    
    // TODO: Fetch user from database to ensure they still exist and are active
    // For now, we'll create a mock user from the JWT payload
    req.user = {
      id: payload.userId,
      email: payload.email,
      username: payload.email.split('@')[0], // Extract username from email
      firstName: 'User', // Will be fetched from DB in real implementation
      lastName: 'Name',
      role: payload.role,
      isActive: true,
      emailVerified: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      code: 'TOKEN_INVALID'
    });
  }
};

// Role-based authorization middleware
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Role hierarchy check
export const hasRoleOrHigher = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy: Record<string, number> = {
    'viewer': 1,
    'developer': 2,
    'manager': 3,
    'admin': 4
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
};

// Permission-based authorization
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    try {
      // Import AuthorizationService dynamically to avoid circular dependency
      const { AuthorizationService } = await import('../services/authorizationService');
      
      const hasPermission = AuthorizationService.hasPermission(req.user, permission);
      
      // Audit the permission check
      await AuthorizationService.auditPermissionCheck(
        req.user.id,
        permission.split('.')[0],
        permission.split('.')[1],
        hasPermission,
        undefined,
        { method: req.method, path: req.path }
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: permission,
          role: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        error: 'Permission check failed',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// Project-specific permission check
export const requireProjectPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const projectId = req.params.projectId || req.params.id;
    if (!projectId) {
      return res.status(400).json({
        error: 'Project ID required',
        code: 'PROJECT_ID_REQUIRED'
      });
    }

    try {
      const { AuthorizationService } = await import('../services/authorizationService');
      
      const hasPermission = await AuthorizationService.hasProjectPermission(
        req.user.id,
        projectId,
        permission
      );
      
      // Audit the permission check
      await AuthorizationService.auditPermissionCheck(
        req.user.id,
        permission.split('.')[0],
        permission.split('.')[1],
        hasPermission,
        projectId,
        { method: req.method, path: req.path }
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient project permissions',
          code: 'INSUFFICIENT_PROJECT_PERMISSIONS',
          required: permission,
          projectId,
          role: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Project permission check error:', error);
      return res.status(500).json({
        error: 'Permission check failed',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// Workspace-specific permission check
export const requireWorkspacePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const workspaceId = req.params.workspaceId || req.user.workspace_id;
    if (!workspaceId) {
      return res.status(400).json({
        error: 'Workspace ID required',
        code: 'WORKSPACE_ID_REQUIRED'
      });
    }

    try {
      const { AuthorizationService } = await import('../services/authorizationService');
      
      const hasPermission = await AuthorizationService.hasWorkspacePermission(
        req.user.id,
        workspaceId,
        permission
      );
      
      // Audit the permission check
      await AuthorizationService.auditPermissionCheck(
        req.user.id,
        permission.split('.')[0],
        permission.split('.')[1],
        hasPermission,
        workspaceId,
        { method: req.method, path: req.path }
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient workspace permissions',
          code: 'INSUFFICIENT_WORKSPACE_PERMISSIONS',
          required: permission,
          workspaceId,
          role: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Workspace permission check error:', error);
      return res.status(500).json({
        error: 'Permission check failed',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// Optional authentication (user might or might not be logged in)
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = JwtUtils.getTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = JwtUtils.verifyAccessToken(token);
      req.user = {
        id: payload.userId,
        email: payload.email,
        username: payload.email.split('@')[0],
        firstName: 'User',
        lastName: 'Name',
        role: payload.role,
        isActive: true,
        emailVerified: true,
        created_at: new Date(),
        updated_at: new Date()
      };
    }
    
    next();
  } catch {
    // For optional auth, we don't return an error, just continue without user
    next();
  }
};