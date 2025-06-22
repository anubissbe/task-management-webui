import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { TaskController } from '../controllers/taskController';
import webhookRoutes from './webhooks';
import authRoutes from './auth';
import workspaceRoutes from './workspace';
import mcpRoutes from './mcp';
import { reportRoutes } from './reports';
import notificationRoutes from './notifications';
import { authenticate } from '../middleware/auth';
import { workspaceContext } from '../middleware/workspace';

const router = Router();
const projectController = new ProjectController();
const taskController = new TaskController();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication routes
router.use('/auth', authRoutes);

// Workspace routes (protected by authentication)
router.use('/workspaces', workspaceRoutes);

// Project routes (protected by authentication and workspace context)
router.get('/projects', authenticate, workspaceContext, projectController.getAllProjects);
router.get('/projects/:id', authenticate, workspaceContext, projectController.getProjectById);
router.post('/projects', authenticate, workspaceContext, projectController.createProject);
router.put('/projects/:id', authenticate, workspaceContext, projectController.updateProject);
router.delete('/projects/:id', authenticate, workspaceContext, projectController.deleteProject);
router.get('/projects/:id/stats', authenticate, workspaceContext, projectController.getProjectStats);

// Task routes (protected by authentication and workspace context)
router.get('/projects/:projectId/tasks', authenticate, workspaceContext, taskController.getTasksByProject);
router.get('/tasks/:id', authenticate, workspaceContext, taskController.getTaskById);
router.get('/tasks/:id/subtasks', authenticate, workspaceContext, taskController.getSubtasks);
router.post('/tasks', authenticate, workspaceContext, taskController.createTask);
router.put('/tasks/:id', authenticate, workspaceContext, taskController.updateTask);
router.patch('/tasks/:id/status', authenticate, workspaceContext, taskController.updateTaskStatus);
router.delete('/tasks/:id', authenticate, workspaceContext, taskController.deleteTask);
router.get('/tasks/:id/history', authenticate, workspaceContext, taskController.getTaskHistory);
router.post('/tasks/:id/test-results', authenticate, workspaceContext, taskController.addTestResult);
router.get('/tasks/:id/test-results', authenticate, workspaceContext, taskController.getTestResults);
router.get('/next-task', authenticate, workspaceContext, taskController.getNextTask);

// Webhook routes
router.use('/webhooks', webhookRoutes);

// MCP Integration routes (protected by authentication and workspace context)
router.use('/mcp', mcpRoutes);

// Reporting routes (protected by authentication and workspace context)
router.use('/reports', reportRoutes);

// Notification routes (protected by authentication and workspace context)
router.use('/notifications', notificationRoutes);

export default router;