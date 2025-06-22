import { pool } from '../config/database';
import { Workspace, WorkspaceMember, WorkspaceInvitation, WorkspaceRole } from '../types';
import crypto from 'crypto';

export class WorkspaceService {
  // Create a new workspace
  static async createWorkspace(data: {
    name: string;
    description?: string;
    owner_id: string;
  }): Promise<Workspace> {
    const slug = data.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now();

    const query = `
      INSERT INTO workspaces (name, slug, description, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [
      data.name,
      slug,
      data.description || null,
      data.owner_id
    ]);

    const workspace = result.rows[0];

    // Add owner as workspace member
    await this.addMember({
      workspace_id: workspace.id,
      user_id: data.owner_id,
      role: 'owner' as WorkspaceRole,
      invited_by: data.owner_id
    });

    return workspace;
  }

  // Get all workspaces for a user
  static async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const query = `
      SELECT w.* FROM workspaces w
      INNER JOIN workspace_members wm ON w.id = wm.workspace_id
      WHERE wm.user_id = $1 AND w.is_active = true
      ORDER BY w.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Get workspace by ID
  static async getWorkspaceById(workspaceId: string, userId: string): Promise<Workspace | null> {
    // Verify user has access
    const hasAccess = await this.checkWorkspaceAccess(userId, workspaceId);
    if (!hasAccess) {
      return null;
    }

    const query = `SELECT * FROM workspaces WHERE id = $1 AND is_active = true`;
    const result = await pool.query(query, [workspaceId]);
    return result.rows[0] || null;
  }

  // Get workspace by slug
  static async getWorkspaceBySlug(slug: string, userId: string): Promise<Workspace | null> {
    const query = `
      SELECT w.* FROM workspaces w
      INNER JOIN workspace_members wm ON w.id = wm.workspace_id
      WHERE w.slug = $1 AND wm.user_id = $2 AND w.is_active = true
    `;

    const result = await pool.query(query, [slug, userId]);
    return result.rows[0] || null;
  }

  // Update workspace
  static async updateWorkspace(
    workspaceId: string, 
    userId: string,
    data: any
  ): Promise<Workspace | null> {
    // Check if user is owner or admin
    const member = await this.getWorkspaceMember(workspaceId, userId);
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      throw new Error('Insufficient permissions to update workspace');
    }

    const allowedFields = ['name', 'description', 'logo_url', 'settings'];
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (data[field as keyof Workspace] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(data[field as keyof Workspace]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return this.getWorkspaceById(workspaceId, userId);
    }

    values.push(workspaceId);
    const query = `
      UPDATE workspaces 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete workspace (soft delete)
  static async deleteWorkspace(workspaceId: string, userId: string): Promise<boolean> {
    // Only owner can delete workspace
    const member = await this.getWorkspaceMember(workspaceId, userId);
    if (!member || member.role !== 'owner') {
      throw new Error('Only workspace owner can delete the workspace');
    }

    const query = `
      UPDATE workspaces 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    const result = await pool.query(query, [workspaceId]);
    return (result.rowCount ?? 0) > 0;
  }

  // Check if user has access to workspace
  static async checkWorkspaceAccess(userId: string, workspaceId: string): Promise<boolean> {
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM workspace_members
        WHERE user_id = $1 AND workspace_id = $2
      )
    `;

    const result = await pool.query(query, [userId, workspaceId]);
    return result.rows[0].exists;
  }

  // Get workspace member
  static async getWorkspaceMember(
    workspaceId: string, 
    userId: string
  ): Promise<WorkspaceMember | null> {
    const query = `
      SELECT * FROM workspace_members 
      WHERE workspace_id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [workspaceId, userId]);
    return result.rows[0] || null;
  }

  // Get all workspace members
  static async getWorkspaceMembers(
    workspaceId: string,
    userId: string
  ): Promise<Array<WorkspaceMember & { user: any }>> {
    // Verify user has access
    const hasAccess = await this.checkWorkspaceAccess(userId, workspaceId);
    if (!hasAccess) {
      throw new Error('Access denied to workspace');
    }

    const query = `
      SELECT 
        wm.*,
        u.email,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM workspace_members wm
      INNER JOIN users u ON wm.user_id = u.id
      WHERE wm.workspace_id = $1
      ORDER BY 
        CASE wm.role 
          WHEN 'owner' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'member' THEN 3
        END,
        wm.joined_at
    `;

    const result = await pool.query(query, [workspaceId]);
    return result.rows.map(row => ({
      id: row.id,
      workspace_id: row.workspace_id,
      user_id: row.user_id,
      role: row.role,
      joined_at: row.joined_at,
      invited_by: row.invited_by,
      user: {
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        avatarUrl: row.avatar_url
      }
    }));
  }

  // Add member to workspace
  static async addMember(data: {
    workspace_id: string;
    user_id: string;
    role: WorkspaceRole;
    invited_by?: string;
  }): Promise<WorkspaceMember> {
    const query = `
      INSERT INTO workspace_members (workspace_id, user_id, role, invited_by)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (workspace_id, user_id) DO NOTHING
      RETURNING *
    `;

    const result = await pool.query(query, [
      data.workspace_id,
      data.user_id,
      data.role,
      data.invited_by || null
    ]);

    return result.rows[0];
  }

  // Update member role
  static async updateMemberRole(
    workspaceId: string,
    userId: string,
    targetUserId: string,
    newRole: WorkspaceRole
  ): Promise<WorkspaceMember | null> {
    // Check if user has permission (owner or admin)
    const member = await this.getWorkspaceMember(workspaceId, userId);
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      throw new Error('Insufficient permissions to update member role');
    }

    // Cannot change owner role
    const targetMember = await this.getWorkspaceMember(workspaceId, targetUserId);
    if (!targetMember) {
      throw new Error('Member not found');
    }
    if (targetMember.role === 'owner') {
      throw new Error('Cannot change owner role');
    }

    const query = `
      UPDATE workspace_members 
      SET role = $1
      WHERE workspace_id = $2 AND user_id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [newRole, workspaceId, targetUserId]);
    return result.rows[0] || null;
  }

  // Remove member from workspace
  static async removeMember(
    workspaceId: string,
    userId: string,
    targetUserId: string
  ): Promise<boolean> {
    // Check permissions
    const member = await this.getWorkspaceMember(workspaceId, userId);
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      throw new Error('Insufficient permissions to remove member');
    }

    // Cannot remove owner
    const targetMember = await this.getWorkspaceMember(workspaceId, targetUserId);
    if (!targetMember) {
      return false;
    }
    if (targetMember.role === 'owner') {
      throw new Error('Cannot remove workspace owner');
    }

    const query = `
      DELETE FROM workspace_members 
      WHERE workspace_id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [workspaceId, targetUserId]);
    return (result.rowCount ?? 0) > 0;
  }

  // Create workspace invitation
  static async createInvitation(data: {
    workspace_id: string;
    email: string;
    role: Exclude<WorkspaceRole, 'owner'>;
    invited_by: string;
  }): Promise<WorkspaceInvitation> {
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const query = `
      INSERT INTO workspace_invitations 
      (workspace_id, email, role, invited_by, token, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (workspace_id, email) 
      DO UPDATE SET 
        role = EXCLUDED.role,
        invited_by = EXCLUDED.invited_by,
        token = EXCLUDED.token,
        expires_at = EXCLUDED.expires_at,
        created_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      data.workspace_id,
      data.email,
      data.role,
      data.invited_by,
      token,
      expiresAt
    ]);

    return result.rows[0];
  }

  // Accept invitation
  static async acceptInvitation(token: string, userId: string): Promise<WorkspaceMember> {
    // Get invitation
    const inviteQuery = `
      SELECT * FROM workspace_invitations 
      WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP
    `;
    const inviteResult = await pool.query(inviteQuery, [token]);
    const invitation = inviteResult.rows[0];

    if (!invitation) {
      throw new Error('Invalid or expired invitation');
    }

    // Add user to workspace
    const member = await this.addMember({
      workspace_id: invitation.workspace_id,
      user_id: userId,
      role: invitation.role,
      invited_by: invitation.invited_by
    });

    // Mark invitation as accepted
    await pool.query(
      `UPDATE workspace_invitations SET accepted_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [invitation.id]
    );

    return member;
  }

  // Get workspace statistics
  static async getWorkspaceStats(workspaceId: string, userId: string): Promise<any> {
    // Verify access
    const hasAccess = await this.checkWorkspaceAccess(userId, workspaceId);
    if (!hasAccess) {
      throw new Error('Access denied to workspace');
    }

    const query = `
      SELECT 
        w.id,
        w.name,
        w.subscription_tier,
        COUNT(DISTINCT wm.user_id) as total_users,
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT t.id) as total_teams,
        COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
        COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as completed_projects,
        w.created_at
      FROM workspaces w
      LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
      LEFT JOIN project_management.projects p ON w.id = p.workspace_id
      LEFT JOIN teams t ON w.id = t.workspace_id
      WHERE w.id = $1
      GROUP BY w.id, w.name, w.subscription_tier, w.created_at
    `;

    const result = await pool.query(query, [workspaceId]);
    return result.rows[0];
  }

  // Switch user's current workspace
  static async switchWorkspace(userId: string, workspaceId: string): Promise<void> {
    // Verify user has access
    const hasAccess = await this.checkWorkspaceAccess(userId, workspaceId);
    if (!hasAccess) {
      throw new Error('Access denied to workspace');
    }

    // Update user's current workspace in session
    const query = `
      UPDATE user_sessions 
      SET current_workspace_id = $1
      WHERE user_id = $2
    `;

    await pool.query(query, [workspaceId, userId]);
  }
}