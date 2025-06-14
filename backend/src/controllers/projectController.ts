import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';
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
  async getAllProjects(_req: Request, res: Response): Promise<void> {
    try {
      const projects = await projectService.getAllProjects();
      console.log(`Retrieved ${projects.length} projects from database`);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);
      
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
      const data = createProjectSchema.parse(req.body);
      const project = await projectService.createProject(data);
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
      const project = await projectService.updateProject(id, data);
      
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
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
      const deleted = await projectService.deleteProject(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      
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