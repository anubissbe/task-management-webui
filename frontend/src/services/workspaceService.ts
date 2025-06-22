import { api } from './api';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  owner_id: string;
  settings: {
    features: {
      team_management: boolean;
      advanced_reporting: boolean;
      webhooks: boolean;
      custom_fields: boolean;
    };
    limits: {
      max_projects: number;
      max_users: number;
      max_storage_gb: number;
    };
  };
  subscription_tier: 'free' | 'starter' | 'professional' | 'enterprise';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  invited_by?: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  logo_url?: string;
  settings?: Partial<Workspace['settings']>;
}

export interface InviteMemberData {
  email: string;
  role: 'admin' | 'member';
}

class WorkspaceService {
  // Get all workspaces for the current user
  async getUserWorkspaces(): Promise<Workspace[]> {
    const response = await api.get('/workspaces');
    return response.data;
  }

  // Get workspace by ID
  async getWorkspaceById(id: string): Promise<Workspace> {
    const response = await api.get(`/workspaces/${id}`);
    return response.data;
  }

  // Create new workspace
  async createWorkspace(data: CreateWorkspaceData): Promise<Workspace> {
    const response = await api.post('/workspaces', data);
    return response.data;
  }

  // Update workspace
  async updateWorkspace(id: string, data: UpdateWorkspaceData): Promise<Workspace> {
    const response = await api.put(`/workspaces/${id}`, data);
    return response.data;
  }

  // Delete workspace
  async deleteWorkspace(id: string): Promise<void> {
    await api.delete(`/workspaces/${id}`);
  }

  // Get workspace members
  async getWorkspaceMembers(id: string): Promise<WorkspaceMember[]> {
    const response = await api.get(`/workspaces/${id}/members`);
    return response.data;
  }

  // Invite member to workspace
  async inviteMember(workspaceId: string, data: InviteMemberData): Promise<void> {
    await api.post(`/workspaces/${workspaceId}/invite`, data);
  }

  // Update member role
  async updateMemberRole(workspaceId: string, userId: string, role: 'admin' | 'member'): Promise<WorkspaceMember> {
    const response = await api.put(`/workspaces/${workspaceId}/members/${userId}/role`, { role });
    return response.data;
  }

  // Remove member from workspace
  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  }

  // Accept workspace invitation
  async acceptInvitation(token: string): Promise<{ workspace_id: string; role: string }> {
    const response = await api.post(`/workspaces/invitations/${token}/accept`);
    return response.data;
  }

  // Get workspace statistics
  async getWorkspaceStats(id: string): Promise<any> {
    const response = await api.get(`/workspaces/${id}/stats`);
    return response.data;
  }

  // Switch current workspace
  async switchWorkspace(id: string): Promise<void> {
    await api.post(`/workspaces/${id}/switch`);
  }

  // Helper to add workspace context to API requests
  setWorkspaceHeader(workspaceId: string) {
    api.defaults.headers.common['X-Workspace-Id'] = workspaceId;
  }

  // Clear workspace header
  clearWorkspaceHeader() {
    delete api.defaults.headers.common['X-Workspace-Id'];
  }
}

export const workspaceService = new WorkspaceService();