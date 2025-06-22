import { Request, Response } from 'express';
import { WorkspaceService } from '../services/workspaceService';
import { z } from 'zod';

// Validation schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(200),
  description: z.string().optional()
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  settings: z.object({
    features: z.object({
      team_management: z.boolean(),
      advanced_reporting: z.boolean(),
      webhooks: z.boolean(),
      custom_fields: z.boolean()
    }).partial().optional(),
    limits: z.object({
      max_projects: z.number().positive(),
      max_users: z.number().positive(),
      max_storage_gb: z.number().positive()
    }).partial().optional()
  }).optional()
});

const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'member'])
});

const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member'])
});

export class WorkspaceController {
  // Get all workspaces for the authenticated user
  static async getUserWorkspaces(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const workspaces = await WorkspaceService.getUserWorkspaces(req.user.id);
      res.json(workspaces);
    } catch (error) {
      console.error('Error fetching user workspaces:', error);
      res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
  }

  // Get workspace by ID
  static async getWorkspaceById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const workspace = await WorkspaceService.getWorkspaceById(id, req.user.id);

      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found or access denied' });
      }

      res.json(workspace);
    } catch (error) {
      console.error('Error fetching workspace:', error);
      res.status(500).json({ error: 'Failed to fetch workspace' });
    }
  }

  // Create new workspace
  static async createWorkspace(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const data = createWorkspaceSchema.parse(req.body);
      const workspace = await WorkspaceService.createWorkspace({
        ...data,
        owner_id: req.user.id
      });

      res.status(201).json(workspace);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        });
      }
      console.error('Error creating workspace:', error);
      res.status(500).json({ error: 'Failed to create workspace' });
    }
  }

  // Update workspace
  static async updateWorkspace(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const data = updateWorkspaceSchema.parse(req.body);

      const workspace = await WorkspaceService.updateWorkspace(id, req.user.id, data);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }

      res.json(workspace);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        });
      }
      if ((error as Error).message.includes('Insufficient permissions')) {
        return res.status(403).json({ error: (error as Error).message });
      }
      console.error('Error updating workspace:', error);
      res.status(500).json({ error: 'Failed to update workspace' });
    }
  }

  // Delete workspace
  static async deleteWorkspace(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const success = await WorkspaceService.deleteWorkspace(id, req.user.id);

      if (!success) {
        return res.status(404).json({ error: 'Workspace not found' });
      }

      res.status(204).send();
    } catch (error) {
      if ((error as Error).message.includes('Only workspace owner')) {
        return res.status(403).json({ error: (error as Error).message });
      }
      console.error('Error deleting workspace:', error);
      res.status(500).json({ error: 'Failed to delete workspace' });
    }
  }

  // Get workspace members
  static async getWorkspaceMembers(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const members = await WorkspaceService.getWorkspaceMembers(id, req.user.id);

      res.json(members);
    } catch (error) {
      if ((error as Error).message.includes('Access denied')) {
        return res.status(403).json({ error: (error as Error).message });
      }
      console.error('Error fetching workspace members:', error);
      res.status(500).json({ error: 'Failed to fetch workspace members' });
    }
  }

  // Invite member to workspace
  static async inviteMember(req: Request, res: Response) {
    try {
      if (!req.user || !req.workspaceId) {
        return res.status(401).json({ error: 'Authentication and workspace context required' });
      }

      const data = inviteMemberSchema.parse(req.body);
      
      // Check if user has permission to invite
      const member = await WorkspaceService.getWorkspaceMember(req.workspaceId, req.user.id);
      if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
        return res.status(403).json({ error: 'Insufficient permissions to invite members' });
      }

      const invitation = await WorkspaceService.createInvitation({
        workspace_id: req.workspaceId,
        email: data.email,
        role: data.role,
        invited_by: req.user.id
      });

      // TODO: Send invitation email with invitation.token

      res.status(201).json({
        message: 'Invitation sent successfully',
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expires_at: invitation.expires_at
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        });
      }
      console.error('Error inviting member:', error);
      res.status(500).json({ error: 'Failed to send invitation' });
    }
  }

  // Update member role
  static async updateMemberRole(req: Request, res: Response) {
    try {
      if (!req.user || !req.workspaceId) {
        return res.status(401).json({ error: 'Authentication and workspace context required' });
      }

      const { userId } = req.params;
      const data = updateMemberRoleSchema.parse(req.body);

      const updatedMember = await WorkspaceService.updateMemberRole(
        req.workspaceId,
        req.user.id,
        userId,
        data.role
      );

      if (!updatedMember) {
        return res.status(404).json({ error: 'Member not found' });
      }

      res.json(updatedMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        });
      }
      if ((error as Error).message.includes('Insufficient permissions')) {
        return res.status(403).json({ error: (error as Error).message });
      }
      console.error('Error updating member role:', error);
      res.status(500).json({ error: 'Failed to update member role' });
    }
  }

  // Remove member from workspace
  static async removeMember(req: Request, res: Response) {
    try {
      if (!req.user || !req.workspaceId) {
        return res.status(401).json({ error: 'Authentication and workspace context required' });
      }

      const { userId } = req.params;
      const success = await WorkspaceService.removeMember(
        req.workspaceId,
        req.user.id,
        userId
      );

      if (!success) {
        return res.status(404).json({ error: 'Member not found' });
      }

      res.status(204).send();
    } catch (error) {
      if ((error as Error).message.includes('Insufficient permissions') || 
          (error as Error).message.includes('Cannot remove')) {
        return res.status(403).json({ error: (error as Error).message });
      }
      console.error('Error removing member:', error);
      res.status(500).json({ error: 'Failed to remove member' });
    }
  }

  // Accept workspace invitation
  static async acceptInvitation(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { token } = req.params;
      const member = await WorkspaceService.acceptInvitation(token, req.user.id);

      res.json({
        message: 'Successfully joined workspace',
        workspace_id: member.workspace_id,
        role: member.role
      });
    } catch (error) {
      if ((error as Error).message.includes('Invalid or expired')) {
        return res.status(400).json({ error: (error as Error).message });
      }
      console.error('Error accepting invitation:', error);
      res.status(500).json({ error: 'Failed to accept invitation' });
    }
  }

  // Get workspace statistics
  static async getWorkspaceStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const stats = await WorkspaceService.getWorkspaceStats(id, req.user.id);

      res.json(stats);
    } catch (error) {
      if ((error as Error).message.includes('Access denied')) {
        return res.status(403).json({ error: (error as Error).message });
      }
      console.error('Error fetching workspace stats:', error);
      res.status(500).json({ error: 'Failed to fetch workspace statistics' });
    }
  }

  // Switch current workspace
  static async switchWorkspace(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      await WorkspaceService.switchWorkspace(req.user.id, id);

      res.json({ 
        message: 'Workspace switched successfully',
        workspace_id: id
      });
    } catch (error) {
      if ((error as Error).message.includes('Access denied')) {
        return res.status(403).json({ error: (error as Error).message });
      }
      console.error('Error switching workspace:', error);
      res.status(500).json({ error: 'Failed to switch workspace' });
    }
  }
}