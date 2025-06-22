import { pool } from '../config/database';
import { User } from '../types';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface RolePermission {
  role: string;
  permissions: string[];
}

export interface ProjectPermission {
  userId: string;
  projectId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  grantedBy: string;
  grantedAt: Date;
}

export class AuthorizationService {
  // Default role-based permissions
  private static readonly ROLE_PERMISSIONS: Record<string, string[]> = {
    'admin': ['*'], // Admin has all permissions
    'manager': [
      // Project permissions
      'projects.read', 'projects.write', 'projects.delete', 'projects.manage',
      // Task permissions
      'tasks.read', 'tasks.write', 'tasks.delete', 'tasks.assign',
      // Team permissions
      'teams.read', 'teams.write', 'teams.delete', 'teams.manage',
      // User permissions
      'users.read', 'users.manage',
      // Workspace permissions
      'workspaces.read', 'workspaces.write',
      // Report permissions
      'reports.read', 'reports.write',
      // Notification permissions
      'notifications.read', 'notifications.write',
      // Webhook permissions
      'webhooks.read', 'webhooks.write'
    ],
    'developer': [
      // Project permissions
      'projects.read', 'projects.write',
      // Task permissions
      'tasks.read', 'tasks.write', 'tasks.assign',
      // Team permissions
      'teams.read',
      // Report permissions
      'reports.read',
      // Notification permissions
      'notifications.read', 'notifications.write'
    ],
    'viewer': [
      // Project permissions
      'projects.read',
      // Task permissions
      'tasks.read',
      // Team permissions
      'teams.read',
      // Report permissions
      'reports.read',
      // Notification permissions
      'notifications.read'
    ]
  };

  // Check if user has permission (role-based)
  static hasPermission(user: User, permission: string): boolean {
    const userPermissions = this.ROLE_PERMISSIONS[user.role] || [];
    
    // Admin has all permissions
    if (userPermissions.includes('*')) {
      return true;
    }
    
    // Check exact permission match
    if (userPermissions.includes(permission)) {
      return true;
    }
    
    // Check wildcard permissions (e.g., "projects.*" for "projects.read")
    const [resource] = permission.split('.');
    const wildcardPermission = `${resource}.*`;
    if (userPermissions.includes(wildcardPermission)) {
      return true;
    }
    
    return false;
  }

  // Check if user has role hierarchy permission
  static hasRoleOrHigher(userRole: string, requiredRole: string): boolean {
    const roleHierarchy: Record<string, number> = {
      'viewer': 1,
      'developer': 2,
      'manager': 3,
      'admin': 4
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  // Check project-specific permissions
  static async hasProjectPermission(
    userId: string, 
    projectId: string, 
    requiredPermission: string
  ): Promise<boolean> {
    try {
      // First check if user has global permission
      const user = await this.getUserById(userId);
      if (user && this.hasPermission(user, requiredPermission)) {
        return true;
      }

      // Check project-specific permissions
      const result = await pool.query(`
        SELECT pp.role, p.created_by
        FROM project_permissions pp
        LEFT JOIN projects p ON p.id = pp.project_id
        WHERE pp.user_id = $1 AND pp.project_id = $2
      `, [userId, projectId]);

      if (result.rows.length === 0) {
        return false;
      }

      const { role: projectRole, created_by } = result.rows[0];

      // Project owner has all permissions
      if (created_by === userId) {
        return true;
      }

      // Check project role permissions
      const projectRolePermissions: Record<string, string[]> = {
        'owner': ['*'],
        'admin': [
          'projects.read', 'projects.write', 'projects.delete',
          'tasks.read', 'tasks.write', 'tasks.delete', 'tasks.assign',
          'teams.read', 'teams.write'
        ],
        'member': [
          'projects.read', 'projects.write',
          'tasks.read', 'tasks.write', 'tasks.assign'
        ],
        'viewer': [
          'projects.read', 'tasks.read'
        ]
      };

      const permissions = projectRolePermissions[projectRole] || [];
      return permissions.includes('*') || permissions.includes(requiredPermission);

    } catch (error) {
      console.error('Error checking project permission:', error);
      return false;
    }
  }

  // Check workspace permissions
  static async hasWorkspacePermission(
    userId: string, 
    workspaceId: string, 
    requiredPermission: string
  ): Promise<boolean> {
    try {
      // Check workspace membership and role
      const result = await pool.query(`
        SELECT wm.role, w.created_by
        FROM workspace_members wm
        LEFT JOIN workspaces w ON w.id = wm.workspace_id
        WHERE wm.user_id = $1 AND wm.workspace_id = $2
      `, [userId, workspaceId]);

      if (result.rows.length === 0) {
        return false;
      }

      const { role: workspaceRole, created_by } = result.rows[0];

      // Workspace owner has all permissions
      if (created_by === userId) {
        return true;
      }

      // Check workspace role permissions
      const workspaceRolePermissions: Record<string, string[]> = {
        'owner': ['*'],
        'admin': [
          'workspaces.read', 'workspaces.write',
          'projects.read', 'projects.write', 'projects.delete',
          'tasks.read', 'tasks.write', 'tasks.delete',
          'teams.read', 'teams.write', 'teams.delete',
          'users.read', 'users.manage'
        ],
        'member': [
          'workspaces.read',
          'projects.read', 'projects.write',
          'tasks.read', 'tasks.write',
          'teams.read'
        ]
      };

      const permissions = workspaceRolePermissions[workspaceRole] || [];
      return permissions.includes('*') || permissions.includes(requiredPermission);

    } catch (error) {
      console.error('Error checking workspace permission:', error);
      return false;
    }
  }

  // Grant project permission to user
  static async grantProjectPermission(
    projectId: string,
    userId: string,
    role: 'owner' | 'admin' | 'member' | 'viewer',
    grantedBy: string
  ): Promise<boolean> {
    try {
      await pool.query(`
        INSERT INTO project_permissions (project_id, user_id, role, granted_by, granted_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (project_id, user_id)
        DO UPDATE SET role = $3, granted_by = $4, granted_at = CURRENT_TIMESTAMP
      `, [projectId, userId, role, grantedBy]);

      return true;
    } catch (error) {
      console.error('Error granting project permission:', error);
      return false;
    }
  }

  // Revoke project permission from user
  static async revokeProjectPermission(
    projectId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const result = await pool.query(`
        DELETE FROM project_permissions
        WHERE project_id = $1 AND user_id = $2
      `, [projectId, userId]);

      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error revoking project permission:', error);
      return false;
    }
  }

  // Get user's project permissions
  static async getUserProjectPermissions(userId: string): Promise<ProjectPermission[]> {
    try {
      const result = await pool.query(`
        SELECT 
          pp.project_id,
          pp.role,
          pp.granted_by,
          pp.granted_at,
          p.name as project_name
        FROM project_permissions pp
        LEFT JOIN projects p ON p.id = pp.project_id
        WHERE pp.user_id = $1
        ORDER BY pp.granted_at DESC
      `, [userId]);

      return result.rows.map(row => ({
        userId,
        projectId: row.project_id,
        role: row.role,
        grantedBy: row.granted_by,
        grantedAt: row.granted_at
      }));
    } catch (error) {
      console.error('Error getting user project permissions:', error);
      return [];
    }
  }

  // Get all permissions for a role
  static getRolePermissions(role: string): string[] {
    return this.ROLE_PERMISSIONS[role] || [];
  }

  // Check if user can access resource
  static async canAccessResource(
    user: User,
    resource: string,
    action: string,
    resourceId?: string
  ): Promise<boolean> {
    const permission = `${resource}.${action}`;

    // Check global permission first
    if (this.hasPermission(user, permission)) {
      return true;
    }

    // Check resource-specific permissions if resourceId is provided
    if (resourceId) {
      if (resource === 'projects') {
        return await this.hasProjectPermission(user.id, resourceId, permission);
      }
      
      if (resource === 'workspaces' && user.workspace_id) {
        return await this.hasWorkspacePermission(user.id, user.workspace_id, permission);
      }
    }

    return false;
  }

  // Utility method to get user by ID
  private static async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        username: `${user.first_name} ${user.last_name}`,
        role: user.role,
        workspace_id: user.current_workspace_id,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  // Audit permission check
  static async auditPermissionCheck(
    userId: string,
    resource: string,
    action: string,
    granted: boolean,
    resourceId?: string,
    context?: any
  ): Promise<void> {
    try {
      await pool.query(`
        INSERT INTO permission_audit_log (
          user_id, resource, action, resource_id, granted, context, checked_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      `, [
        userId,
        resource,
        action,
        resourceId,
        granted,
        context ? JSON.stringify(context) : null
      ]);
    } catch (error) {
      console.error('Error auditing permission check:', error);
      // Don't throw error for audit logging
    }
  }
}