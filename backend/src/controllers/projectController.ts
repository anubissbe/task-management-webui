
function sanitizeForLog(str: any): string {
    if (typeof str !== 'string') {
        return JSON.stringify(str).replace(/[\r\n]/g, ' ');
    }
    return str.replace(/[\r\n]/g, ' ');
}

import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';
import { triggerWebhooksForEvent } from './webhookController';
import { z } from 'zod';

const projectService = new ProjectService();

// Emergency direct database connection (for future use)
// const directDbPool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: false
// });

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  requirements: z.string().optional(),
  acceptance_criteria: z.string().optional()
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'paused', 'completed', 'cancelled']).optional(),
  requirements: z.string().optional(),
  acceptance_criteria: z.string().optional()
});

export class ProjectController {
  async getAllProjects(req: Request, res: Response): Promise<void> {
    try {
      if (!req.workspaceId) {
        res.status(400).json({ error: 'Workspace context required' });
        return;
      }
      const projects = await projectService.getAllProjects(req.workspaceId);
      console.log('Retrieved ');
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!req.workspaceId) {
        res.status(400).json({ error: 'Workspace context required' });
        return;
      }
      const project = await projectService.getProjectById(id, req.workspaceId);
      
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      
      console.log('Retrieved project from database:', project.name);
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  }

  async createProject(req: Request, res: Response): Promise<void> {
    try {
      if (!req.workspaceId) {
        res.status(400).json({ error: 'Workspace context required' });
        return;
      }
      
      const data = createProjectSchema.parse(req.body);
      const project = await projectService.createProject({
        ...data,
        workspace_id: req.workspaceId
      });
      
      // Trigger webhooks for project creation
      await triggerWebhooksForEvent('project.created', project, undefined, project.id);
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
        return;
      }
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }

  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = updateProjectSchema.parse(req.body);
      
      if (!req.workspaceId) {
        res.status(400).json({ error: 'Workspace context required' });
        return;
      }
      
      // Get previous project state for webhook comparison
      const previousProject = await projectService.getProjectById(id, req.workspaceId);
      if (!previousProject) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      
      const project = await projectService.updateProject(id, data, req.workspaceId);
      
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      
      // Trigger webhooks for project update
      await triggerWebhooksForEvent('project.updated', project, previousProject, project.id);
      
      // Check if project was completed
      if (project.status === 'completed' && previousProject.status !== 'completed') {
        await triggerWebhooksForEvent('project.completed', project, previousProject, project.id);
      }
      
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
        return;
      }
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  }

  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!req.workspaceId) {
        res.status(400).json({ error: 'Workspace context required' });
        return;
      }
      
      // Get project data before deletion for webhook
      const project = await projectService.getProjectById(id, req.workspaceId);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      
      const deleted = await projectService.deleteProject(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      
      // Trigger webhooks for project deletion
      await triggerWebhooksForEvent('project.deleted', project, undefined, project.id);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  }

  async getProjectStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await projectService.getProjectStats(id);
      
      if (!stats) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching project stats:', error);
      res.status(500).json({ error: 'Failed to fetch project stats' });
    }
  }
}