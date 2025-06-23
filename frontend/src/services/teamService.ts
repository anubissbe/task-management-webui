import { api } from './api';

// Temporary implementation of apiRequest to maintain compatibility
const apiRequest = async <T = unknown>(url: string, options?: { method?: string; body?: string }): Promise<T> => {
  const method = options?.method?.toLowerCase() || 'get';
  const config: Record<string, unknown> = {};
  
  if (options?.body) {
    config.data = JSON.parse(options.body);
  }
  
  const response = await (api as Record<string, (...args: unknown[]) => Promise<{ data: T }>>)[method](url, method === 'get' ? undefined : config.data, method === 'get' ? config : undefined);
  return response.data;
};

export interface Team {
  id: string;
  name: string;
  description?: string;
  slug: string;
  avatar_url?: string;
  owner_id: string;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  member_count?: number;
  project_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
  invited_by?: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    is_active: boolean;
  };
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  slug: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  avatar_url?: string;
  settings?: Record<string, unknown>;
  is_active?: boolean;
}

export interface InviteTeamMemberRequest {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface UpdateTeamMemberRequest {
  role: 'admin' | 'member' | 'viewer';
}

export class TeamService {
  // Team CRUD operations
  static async getTeams(page = 1, limit = 20, search?: string): Promise<{
    teams: Team[];
    total: number;
    pages: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    return apiRequest(`/teams?${params}`);
  }

  static async getTeamById(id: string): Promise<Team> {
    return apiRequest(`/teams/${id}`);
  }

  static async createTeam(data: CreateTeamRequest): Promise<Team> {
    return apiRequest('/teams', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async updateTeam(id: string, data: UpdateTeamRequest): Promise<Team> {
    return apiRequest(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  static async deleteTeam(id: string): Promise<void> {
    return apiRequest(`/teams/${id}`, {
      method: 'DELETE'
    });
  }

  // Team member operations
  static async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return apiRequest(`/teams/${teamId}/members`);
  }

  static async inviteTeamMember(teamId: string, data: InviteTeamMemberRequest): Promise<TeamInvitation> {
    return apiRequest(`/teams/${teamId}/invite`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async updateTeamMember(teamId: string, userId: string, data: UpdateTeamMemberRequest): Promise<TeamMember> {
    return apiRequest(`/teams/${teamId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  static async removeTeamMember(teamId: string, userId: string): Promise<void> {
    return apiRequest(`/teams/${teamId}/members/${userId}`, {
      method: 'DELETE'
    });
  }

  // Team invitation operations
  static async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    return apiRequest(`/teams/${teamId}/invitations`);
  }

  static async cancelTeamInvitation(teamId: string, invitationId: string): Promise<void> {
    return apiRequest(`/teams/${teamId}/invitations/${invitationId}`, {
      method: 'DELETE'
    });
  }

  static async acceptTeamInvitation(token: string): Promise<TeamMember> {
    return apiRequest('/teams/accept-invitation', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  // User's teams
  static async getMyTeams(): Promise<Team[]> {
    return apiRequest('/teams/my-teams');
  }

  static async leaveTeam(teamId: string): Promise<void> {
    return apiRequest(`/teams/${teamId}/leave`, {
      method: 'POST'
    });
  }

  // Team stats and analytics
  static async getTeamStats(teamId: string): Promise<{
    member_count: number;
    project_count: number;
    task_count: number;
    completed_tasks: number;
    active_projects: number;
    recent_activity: Array<{ id: string; type: string; description: string; timestamp: string }>;
  }> {
    return apiRequest(`/teams/${teamId}/stats`);
  }

  // Team projects and permissions
  static async getTeamProjects(teamId: string): Promise<Array<{ id: string; name: string; description?: string; status: string }>> {
    return apiRequest(`/teams/${teamId}/projects`);
  }

  static async addTeamToProject(teamId: string, projectId: string, permission: string): Promise<void> {
    return apiRequest(`/teams/${teamId}/projects`, {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, permission })
    });
  }

  static async removeTeamFromProject(teamId: string, projectId: string): Promise<void> {
    return apiRequest(`/teams/${teamId}/projects/${projectId}`, {
      method: 'DELETE'
    });
  }

  // Utility functions
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  static isValidSlug(slug: string): boolean {
    return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 50;
  }

  static getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      owner: ['manage_team', 'manage_members', 'manage_projects', 'view_all'],
      admin: ['manage_members', 'manage_projects', 'view_all'],
      member: ['manage_projects', 'view_all'],
      viewer: ['view_all']
    };

    return permissions[role] || [];
  }

  static canUserPerformAction(userRole: string, action: string): boolean {
    const permissions = this.getRolePermissions(userRole);
    return permissions.includes(action) || permissions.includes('*');
  }
}