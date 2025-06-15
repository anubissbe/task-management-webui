"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const projectService_1 = require("../services/projectService");
const zod_1 = require("zod");
const projectService = new projectService_1.ProjectService();
// Validation schemas
const createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().optional(),
    requirements: zod_1.z.string().optional(),
    acceptance_criteria: zod_1.z.string().optional()
});
const updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['planning', 'active', 'paused', 'completed', 'cancelled']).optional(),
    requirements: zod_1.z.string().optional(),
    acceptance_criteria: zod_1.z.string().optional()
});
class ProjectController {
    async getAllProjects(_req, res) {
        try {
            const projects = await projectService.getAllProjects();
            res.json(projects);
        }
        catch (error) {
            console.error('Error fetching projects:', error);
            res.status(500).json({ error: 'Failed to fetch projects' });
        }
    }
    async getProjectById(req, res) {
        try {
            const { id } = req.params;
            const project = await projectService.getProjectById(id);
            if (!project) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }
            res.json(project);
        }
        catch (error) {
            console.error('Error fetching project:', error);
            res.status(500).json({ error: 'Failed to fetch project' });
        }
    }
    async createProject(req, res) {
        try {
            const data = createProjectSchema.parse(req.body);
            const project = await projectService.createProject(data);
            res.status(201).json(project);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ error: 'Invalid request data', details: error.errors });
                return;
            }
            console.error('Error creating project:', error);
            res.status(500).json({ error: 'Failed to create project' });
        }
    }
    async updateProject(req, res) {
        try {
            const { id } = req.params;
            const data = updateProjectSchema.parse(req.body);
            const project = await projectService.updateProject(id, data);
            if (!project) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }
            res.json(project);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ error: 'Invalid request data', details: error.errors });
                return;
            }
            console.error('Error updating project:', error);
            res.status(500).json({ error: 'Failed to update project' });
        }
    }
    async deleteProject(req, res) {
        try {
            const { id } = req.params;
            const deleted = await projectService.deleteProject(id);
            if (!deleted) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting project:', error);
            res.status(500).json({ error: 'Failed to delete project' });
        }
    }
    async getProjectStats(req, res) {
        try {
            const { id } = req.params;
            const stats = await projectService.getProjectStats(id);
            if (!stats) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }
            res.json(stats);
        }
        catch (error) {
            console.error('Error fetching project stats:', error);
            res.status(500).json({ error: 'Failed to fetch project stats' });
        }
    }
}
exports.ProjectController = ProjectController;
