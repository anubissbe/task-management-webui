import { Request } from 'express';
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface DatabaseUser {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'developer' | 'viewer';
  avatar_url?: string;
  is_active: boolean;
  email_verified: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  refresh_token: string;
  access_token_hash?: string;
  device_info: any;
  ip_address?: string;
  expires_at: Date;
  created_at: Date;
  last_used_at: Date;
  is_active: boolean;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'developer' | 'viewer';
}

export class AuthService {
  static async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  static async getUserById(id: string): Promise<DatabaseUser | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  static async createUser(userData: CreateUserData): Promise<string> {
    try {
      const userId = uuidv4();
      
      await pool.query(`
        INSERT INTO users (
          id, email, password_hash, first_name, last_name, role, 
          is_active, email_verified, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        userId,
        userData.email,
        userData.passwordHash,
        userData.firstName,
        userData.lastName,
        userData.role,
        true,
        false
      ]);

      // Create default user preferences
      await pool.query(`
        INSERT INTO user_preferences (user_id, theme, timezone, language)
        VALUES ($1, 'light', 'UTC', 'en')
      `, [userId]);

      return userId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateLastLogin(userId: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  static async updatePassword(userId: string, passwordHash: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [passwordHash, userId]
      );
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  static async saveRefreshToken(
    userId: string, 
    refreshToken: string, 
    req: Request
  ): Promise<string> {
    try {
      const sessionId = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      const deviceInfo = {
        userAgent: req.headers['user-agent'] || 'Unknown',
        platform: req.headers['sec-ch-ua-platform'] || 'Unknown'
      };

      const ipAddress = req.ip || req.connection.remoteAddress || null;

      await pool.query(`
        INSERT INTO user_sessions (
          id, user_id, refresh_token, device_info, ip_address, 
          expires_at, created_at, last_used_at, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true)
      `, [
        sessionId,
        userId,
        refreshToken,
        JSON.stringify(deviceInfo),
        ipAddress,
        expiresAt
      ]);

      return sessionId;
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  static async getSessionByRefreshToken(refreshToken: string): Promise<UserSession | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM user_sessions WHERE refresh_token = $1',
        [refreshToken]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting session by refresh token:', error);
      throw error;
    }
  }

  static async updateSessionLastUsed(sessionId: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE user_sessions SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1',
        [sessionId]
      );
    } catch (error) {
      console.error('Error updating session last used:', error);
      throw error;
    }
  }

  static async deactivateSession(sessionId: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE user_sessions SET is_active = false WHERE id = $1',
        [sessionId]
      );
    } catch (error) {
      console.error('Error deactivating session:', error);
      throw error;
    }
  }

  static async deactivateSessionByRefreshToken(refreshToken: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE user_sessions SET is_active = false WHERE refresh_token = $1',
        [refreshToken]
      );
    } catch (error) {
      console.error('Error deactivating session by refresh token:', error);
      throw error;
    }
  }

  static async deactivateAllUserSessions(userId: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
        [userId]
      );
    } catch (error) {
      console.error('Error deactivating all user sessions:', error);
      throw error;
    }
  }

  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await pool.query(
        'UPDATE user_sessions SET is_active = false WHERE expires_at < CURRENT_TIMESTAMP'
      );
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      throw error;
    }
  }

  static async getUserSessions(userId: string): Promise<UserSession[]> {
    try {
      const result = await pool.query(`
        SELECT * FROM user_sessions 
        WHERE user_id = $1 AND is_active = true 
        ORDER BY last_used_at DESC
      `, [userId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting user sessions:', error);
      throw error;
    }
  }

  static async logActivity(
    userId: string | null,
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any,
    req?: Request
  ): Promise<void> {
    try {
      const activityId = uuidv4();
      const ipAddress = req?.ip || req?.connection.remoteAddress || null;
      const userAgent = req?.headers['user-agent'] || null;

      await pool.query(`
        INSERT INTO activity_logs (
          id, user_id, action, resource_type, resource_id, 
          details, ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `, [
        activityId,
        userId,
        action,
        resourceType,
        resourceId,
        details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent
      ]);
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error for activity logging to avoid breaking main flow
    }
  }

  static async getUserStats(userId: string): Promise<any> {
    try {
      const [userResult, activityResult, sessionResult] = await Promise.all([
        pool.query('SELECT created_at, last_login FROM users WHERE id = $1', [userId]),
        pool.query(`
          SELECT 
            COUNT(*) as total_activities,
            COUNT(DISTINCT DATE(created_at)) as active_days
          FROM activity_logs 
          WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        `, [userId]),
        pool.query(`
          SELECT COUNT(*) as active_sessions
          FROM user_sessions 
          WHERE user_id = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP
        `, [userId])
      ]);

      return {
        accountAge: userResult.rows[0]?.created_at,
        lastLogin: userResult.rows[0]?.last_login,
        totalActivities: parseInt(activityResult.rows[0]?.total_activities || '0'),
        activeDays: parseInt(activityResult.rows[0]?.active_days || '0'),
        activeSessions: parseInt(sessionResult.rows[0]?.active_sessions || '0')
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  static async generatePasswordResetToken(userId: string): Promise<string> {
    try {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

      // Store the reset token
      await pool.query(`
        INSERT INTO password_reset_tokens (
          id, user_id, token, expires_at, created_at, is_used
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, false)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          token = $3, 
          expires_at = $4, 
          created_at = CURRENT_TIMESTAMP,
          is_used = false
      `, [uuidv4(), userId, resetToken, expiresAt]);

      return resetToken;
    } catch (error) {
      console.error('Error generating password reset token:', error);
      throw error;
    }
  }

  static async verifyPasswordResetToken(token: string): Promise<string | null> {
    try {
      const result = await pool.query(`
        SELECT user_id, expires_at, is_used
        FROM password_reset_tokens 
        WHERE token = $1
      `, [token]);

      if (result.rows.length === 0) {
        return null;
      }

      const { user_id, expires_at, is_used } = result.rows[0];

      // Check if token is already used
      if (is_used) {
        return null;
      }

      // Check if token has expired
      if (new Date() > new Date(expires_at)) {
        return null;
      }

      // Mark token as used
      await pool.query(
        'UPDATE password_reset_tokens SET is_used = true WHERE token = $1',
        [token]
      );

      return user_id;
    } catch (error) {
      console.error('Error verifying password reset token:', error);
      throw error;
    }
  }

  static async cleanupExpiredResetTokens(): Promise<void> {
    try {
      await pool.query(
        'DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP OR is_used = true'
      );
    } catch (error) {
      console.error('Error cleaning up expired reset tokens:', error);
      throw error;
    }
  }
}