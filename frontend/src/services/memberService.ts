import { api } from './api';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  joinedAt: string;
}

class MemberService {
  async getWorkspaceMembers(workspaceId: string): Promise<Member[]> {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/members`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workspace members:', error);
      return [];
    }
  }

  async inviteMember(workspaceId: string, email: string, role: string = 'member'): Promise<void> {
    await api.post(`/workspaces/${workspaceId}/members/invite`, { email, role });
  }

  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  }

  async updateMemberRole(workspaceId: string, memberId: string, role: string): Promise<void> {
    await api.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role });
  }
}

export const memberService = new MemberService();