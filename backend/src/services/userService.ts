import { pool } from '../config/database';
import { DatabaseUser } from './authService';

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    in_app: boolean;
  };
  dashboard_layout: any;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: 'admin' | 'manager' | 'developer' | 'viewer';
  isActive?: boolean;
}

export interface UserWithStats extends DatabaseUser {
  stats?: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    activeSessions: number;
    lastActivity?: Date;
  };
}

export class UserService {
  static async getAllUsers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    role?: string,
    isActive?: boolean
  ): Promise<{ users: UserWithStats[]; total: number; pages: number }> {
    try {
      const offset = (page - 1) * limit;
      let whereConditions = [];
      let params: any[] = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        whereConditions.push(`(
          first_name ILIKE $${paramCount} OR 
          last_name ILIKE $${paramCount} OR 
          email ILIKE $${paramCount}
        )`);
        params.push(`%${search}%`);
      }

      if (role) {
        paramCount++;
        whereConditions.push(`role = $${paramCount}`);
        params.push(role);
      }

      if (isActive !== undefined) {
        paramCount++;
        whereConditions.push(`is_active = $${paramCount}`);
        params.push(isActive);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Get total count
      const countResult = await pool.query(`
        SELECT COUNT(*) as total FROM users ${whereClause}
      `, params);
      
      const total = parseInt(countResult.rows[0].total);

      // Get users with stats
      const usersResult = await pool.query(`
        SELECT 
          u.*,
          COUNT(DISTINCT pp.project_id) as total_projects,
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
          COUNT(DISTINCT CASE WHEN s.is_active = true AND s.expires_at > CURRENT_TIMESTAMP THEN s.id END) as active_sessions,
          MAX(al.created_at) as last_activity
        FROM users u
        LEFT JOIN project_permissions pp ON u.id = pp.user_id
        LEFT JOIN tasks t ON pp.project_id = t.project_id
        LEFT JOIN user_sessions s ON u.id = s.user_id
        LEFT JOIN activity_logs al ON u.id = al.user_id
        ${whereClause}
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `, [...params, limit, offset]);

      const users = usersResult.rows.map(row => ({
        id: row.id,
        email: row.email,
        password_hash: row.password_hash,
        first_name: row.first_name,
        last_name: row.last_name,
        role: row.role,
        avatar_url: row.avatar_url,
        is_active: row.is_active,
        email_verified: row.email_verified,
        last_login: row.last_login,
        created_at: row.created_at,
        updated_at: row.updated_at,
        stats: {
          totalProjects: parseInt(row.total_projects || '0'),
          totalTasks: parseInt(row.total_tasks || '0'),
          completedTasks: parseInt(row.completed_tasks || '0'),
          activeSessions: parseInt(row.active_sessions || '0'),
          lastActivity: row.last_activity
        }
      }));

      return {
        users,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error getting all users:', error);
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

  static async updateUser(id: string, userData: UpdateUserData): Promise<DatabaseUser | null> {
    try {
      const setClauses = [];
      const params = [];
      let paramCount = 0;

      if (userData.firstName !== undefined) {
        paramCount++;
        setClauses.push(`first_name = $${paramCount}`);
        params.push(userData.firstName);
      }

      if (userData.lastName !== undefined) {
        paramCount++;
        setClauses.push(`last_name = $${paramCount}`);
        params.push(userData.lastName);
      }

      if (userData.avatarUrl !== undefined) {
        paramCount++;
        setClauses.push(`avatar_url = $${paramCount}`);
        params.push(userData.avatarUrl);
      }

      if (userData.role !== undefined) {
        paramCount++;
        setClauses.push(`role = $${paramCount}`);
        params.push(userData.role);
      }

      if (userData.isActive !== undefined) {
        paramCount++;
        setClauses.push(`is_active = $${paramCount}`);
        params.push(userData.isActive);
      }

      if (setClauses.length === 0) {
        return await this.getUserById(id);
      }

      setClauses.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      const result = await pool.query(`
        UPDATE users 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramCount + 1}
        RETURNING *
      `, params);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1',
        [id]
      );
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async deactivateUser(id: string): Promise<boolean> {
    try {
      const result = await pool.query(`
        UPDATE users 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id]);

      // Also deactivate all user sessions
      await pool.query(
        'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
        [id]
      );
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM user_preferences WHERE user_id = $1',
        [userId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  static async updateUserPreferences(
    userId: string, 
    preferences: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<UserPreferences | null> {
    try {
      const setClauses = [];
      const params = [];
      let paramCount = 0;

      if (preferences.theme !== undefined) {
        paramCount++;
        setClauses.push(`theme = $${paramCount}`);
        params.push(preferences.theme);
      }

      if (preferences.timezone !== undefined) {
        paramCount++;
        setClauses.push(`timezone = $${paramCount}`);
        params.push(preferences.timezone);
      }

      if (preferences.language !== undefined) {
        paramCount++;
        setClauses.push(`language = $${paramCount}`);
        params.push(preferences.language);
      }

      if (preferences.notifications !== undefined) {
        paramCount++;
        setClauses.push(`notifications = $${paramCount}`);
        params.push(JSON.stringify(preferences.notifications));
      }

      if (preferences.dashboard_layout !== undefined) {
        paramCount++;
        setClauses.push(`dashboard_layout = $${paramCount}`);
        params.push(JSON.stringify(preferences.dashboard_layout));
      }

      if (setClauses.length === 0) {
        return await this.getUserPreferences(userId);
      }

      setClauses.push('updated_at = CURRENT_TIMESTAMP');
      params.push(userId);

      const result = await pool.query(`
        UPDATE user_preferences 
        SET ${setClauses.join(', ')}
        WHERE user_id = $${paramCount + 1}
        RETURNING *
      `, params);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  static async getUserActivity(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      const result = await pool.query(`
        SELECT 
          action,
          resource_type,
          resource_id,
          details,
          ip_address,
          created_at
        FROM activity_logs
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      return result.rows;
    } catch (error) {
      console.error('Error getting user activity:', error);
      throw error;
    }
  }

  static async getUserRoleStats(): Promise<any> {
    try {
      const result = await pool.query(`
        SELECT 
          role,
          COUNT(*) as count,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
        FROM users
        GROUP BY role
        ORDER BY 
          CASE role
            WHEN 'admin' THEN 1
            WHEN 'manager' THEN 2
            WHEN 'developer' THEN 3
            WHEN 'viewer' THEN 4
          END
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting user role stats:', error);
      throw error;
    }
  }

  static async searchUsers(query: string, limit: number = 10): Promise<DatabaseUser[]> {
    try {
      const result = await pool.query(`
        SELECT id, email, first_name, last_name, role, avatar_url, is_active
        FROM users
        WHERE 
          (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)
          AND is_active = true
        ORDER BY 
          CASE 
            WHEN email ILIKE $1 THEN 1
            WHEN first_name ILIKE $1 OR last_name ILIKE $1 THEN 2
            ELSE 3
          END,
          first_name, last_name
        LIMIT $2
      `, [`%${query}%`, limit]);

      return result.rows;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  static async bulkUpdateUsers(
    userIds: string[],
    updateData: { role?: string; isActive?: boolean }
  ): Promise<number> {
    try {
      const setClauses = [];
      const params: any[] = [userIds];
      let paramCount = 1;

      if (updateData.role !== undefined) {
        paramCount++;
        setClauses.push(`role = $${paramCount}`);
        params.push(updateData.role);
      }

      if (updateData.isActive !== undefined) {
        paramCount++;
        setClauses.push(`is_active = $${paramCount}`);
        params.push(updateData.isActive);
      }

      if (setClauses.length === 0) {
        return 0;
      }

      setClauses.push('updated_at = CURRENT_TIMESTAMP');

      const result = await pool.query(`
        UPDATE users 
        SET ${setClauses.join(', ')}
        WHERE id = ANY($1)
      `, params);

      return result.rowCount || 0;
    } catch (error) {
      console.error('Error bulk updating users:', error);
      throw error;
    }
  }
}