import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { JwtUtils } from '../middleware/auth';
import { AuthService } from '../services/authService';

// Request validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'manager', 'developer', 'viewer']).optional().default('developer')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format')
});

const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});


export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      // Get user by email
      const user = await AuthService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          error: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = JwtUtils.generateAccessToken(tokenPayload);
      const refreshToken = JwtUtils.generateRefreshToken(tokenPayload);

      // Save refresh token to database
      await AuthService.saveRefreshToken(user.id, refreshToken, req);

      // Update last login
      await AuthService.updateLastLogin(user.id);

      // Return user info and tokens
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          avatarUrl: user.avatar_url,
          emailVerified: user.email_verified,
          lastLogin: user.last_login
        },
        accessToken,
        refreshToken,
        expiresIn: '15m'
      });

    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role } = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await AuthService.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'Email already registered',
          code: 'EMAIL_EXISTS'
        });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const userId = await AuthService.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
        role
      });

      // Get created user
      const user = await AuthService.getUserById(userId);
      if (!user) {
        throw new Error('Failed to create user');
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = JwtUtils.generateAccessToken(tokenPayload);
      const refreshToken = JwtUtils.generateRefreshToken(tokenPayload);

      // Save refresh token
      await AuthService.saveRefreshToken(user.id, refreshToken, req);

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          avatarUrl: user.avatar_url,
          emailVerified: user.email_verified
        },
        accessToken,
        refreshToken,
        expiresIn: '15m'
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);

      // Verify refresh token
      const payload = JwtUtils.verifyRefreshToken(refreshToken);

      // Check if refresh token exists in database
      const session = await AuthService.getSessionByRefreshToken(refreshToken);
      if (!session || !session.is_active) {
        return res.status(401).json({
          error: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

      // Check if session has expired
      if (new Date() > session.expires_at) {
        await AuthService.deactivateSession(session.id);
        return res.status(401).json({
          error: 'Refresh token expired',
          code: 'REFRESH_TOKEN_EXPIRED'
        });
      }

      // Get user to ensure they still exist and are active
      const user = await AuthService.getUserById(payload.userId);
      if (!user || !user.is_active) {
        return res.status(401).json({
          error: 'User not found or inactive',
          code: 'USER_INACTIVE'
        });
      }

      // Generate new access token
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = JwtUtils.generateAccessToken(tokenPayload);

      // Update session last used time
      await AuthService.updateSessionLastUsed(session.id);

      res.json({
        accessToken,
        expiresIn: '15m'
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }

      res.status(401).json({
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.body.refreshToken;
      
      if (refreshToken) {
        await AuthService.deactivateSessionByRefreshToken(refreshToken);
      }

      res.json({ message: 'Logged out successfully' });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  static async logoutAll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      await AuthService.deactivateAllUserSessions(req.user.id);

      res.json({ message: 'Logged out from all devices successfully' });

    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Get fresh user data from database
      const user = await AuthService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          avatarUrl: user.avatar_url,
          emailVerified: user.email_verified,
          lastLogin: user.last_login,
          createdAt: user.created_at
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

      // Get user with password hash
      const user = await AuthService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await AuthService.updatePassword(user.id, newPasswordHash);

      // Deactivate all sessions except current one
      await AuthService.deactivateAllUserSessions(user.id);

      res.json({ message: 'Password changed successfully' });

    } catch (error) {
      console.error('Change password error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  static async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = passwordResetRequestSchema.parse(req.body);

      // Get user by email
      const user = await AuthService.getUserByEmail(email);
      
      // Always return success to prevent email enumeration
      // regardless of whether the user exists
      if (!user) {
        return res.json({ 
          message: 'If an account with that email exists, we have sent a password reset link.' 
        });
      }

      // Generate password reset token
      const resetToken = await AuthService.generatePasswordResetToken(user.id);

      // Send password reset email (if email service is available)
      try {
        // Import EmailService dynamically to avoid circular dependency
        const { EmailService } = await import('../services/emailService');
        
        const emailService = new EmailService();
        await emailService.sendPasswordResetEmail({
          user: {
            id: user.id,
            email: user.email,
            username: `${user.first_name} ${user.last_name}`,
            role: user.role as any,
            workspace_id: undefined,
            created_at: user.created_at,
            updated_at: user.updated_at
          },
          resetToken,
          resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password?token=${resetToken}`
        });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't throw error - return success anyway for security
      }

      res.json({ 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      });

    } catch (error) {
      console.error('Password reset request error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = passwordResetSchema.parse(req.body);

      // Verify and consume the reset token
      const userId = await AuthService.verifyPasswordResetToken(token);
      if (!userId) {
        return res.status(400).json({
          error: 'Invalid or expired reset token',
          code: 'INVALID_RESET_TOKEN'
        });
      }

      // Get user to ensure they still exist
      const user = await AuthService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await AuthService.updatePassword(user.id, newPasswordHash);

      // Deactivate all user sessions for security
      await AuthService.deactivateAllUserSessions(user.id);

      // Log the password reset activity
      await AuthService.logActivity(
        user.id,
        'password_reset',
        'user',
        user.id,
        { method: 'reset_token' },
        req
      );

      res.json({ message: 'Password reset successfully' });

    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  static async health(_req: Request, res: Response) {
    try {
      // Basic health check for authentication service
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        database: 'connected',
        jwt: 'operational'
      };

      // Test database connection
      try {
        await AuthService.getUserById('health-check-test-id');
        healthStatus.database = 'connected';
      } catch {
        healthStatus.database = 'disconnected';
        healthStatus.status = 'degraded';
      }

      res.json(healthStatus);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      });
    }
  }
}