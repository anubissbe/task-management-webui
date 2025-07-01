

import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';
import { triggerWebhooksForEvent } from './webhookController';
import { notificationService } from '../services/notificationService';
import { z } from 'zod';

const taskService = new TaskService();

// Validation schemas
const createTaskSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  parent_task_id: z.string().uuid().optional(),
  test_criteria: z.string().optional(),
  estimated_hours: z.number().positive().optional(),
  assigned_to: z.string().uuid().optional()
});

const updateTaskSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'blocked', 'testing', 'completed', 'failed']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  order_index: z.number().int().min(0).optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().positive().optional(),
  implementation_notes: z.string().optional(),
  test_criteria: z.string().optional(),
  verification_steps: z.string().optional(),
  assigned_to: z.string().uuid().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'blocked', 'testing', 'completed', 'failed']),
  notes: z.string().optional()
});

const addTestResultSchema = z.object({
  test_name: z.string().min(1),
  status: z.enum(['passed', 'failed', 'skipped']),
  output: z.string().optional(),
  error_message: z.string().optional()
});

export class TaskController {
  async getTasksByProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { status } = req.query;
      
      const tasks = await taskService.getTasksByProject(projectId, status as any);
      console.log(`Retrieved ${tasks.length} tasks for project:`, projectId);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      res.json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  }

  async getSubtasks(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const subtasks = await taskService.getSubtasks(id);
      res.json(subtasks);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      res.status(500).json({ error: 'Failed to fetch subtasks' });
    }
  }

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const data = createTaskSchema.parse(req.body);
      const task = await taskService.createTask(data);
      
      // Trigger webhooks for task creation
      await triggerWebhooksForEvent('task.created', task, undefined, task.project_id);
      
      // Trigger notification for task assignment if assigned_to is set
      if (data.assigned_to && req.user) {
        try {
          // Create mock objects for notification (in production, these would be fetched from database)
          const mockAssignedUser = {
            id: data.assigned_to,
            email: 'user@example.com', // Would be fetched from user table
            username: 'User',
            role: 'developer' as const,
            created_at: new Date(),
            updated_at: new Date()
          };
          
          const mockProject = {
            id: task.project_id,
            name: 'Project',
            description: 'Project description',
            status: 'active' as const,
            workspace_id: req.headers['x-workspace-id'] as string,
            created_at: new Date(),
            updated_at: new Date()
          };

          const mockWorkspace = {
            id: req.headers['x-workspace-id'] as string,
            name: 'Workspace',
            slug: 'workspace',
            owner_id: req.user.id,
            settings: {
              features: {
                team_management: true,
                advanced_reporting: true,
                webhooks: true,
                custom_fields: false
              },
              limits: {
                max_projects: 100,
                max_users: 50,
                max_storage_gb: 10
              }
            },
            subscription_tier: 'professional' as const,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          };

          const extendedUser = {
            ...req.user,
            username: req.user.firstName + ' ' + req.user.lastName,
            created_at: new Date(),
            updated_at: new Date()
          };

          await notificationService.triggerTaskAssignmentNotification(
            task,
            mockAssignedUser,
            extendedUser,
            mockProject,
            mockWorkspace
          );
        } catch (notificationError) {
          console.error('Failed to send task assignment notification:', notificationError);
          // Don't fail the request if notification fails
        }
      }
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
        return;
      }
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = updateTaskSchema.parse(req.body);
      
      // Get previous task state for webhook comparison
      const previousTask = await taskService.getTaskById(id);
      if (!previousTask) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      const task = await taskService.updateTask(id, data);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      // Trigger webhooks for task update
      await triggerWebhooksForEvent('task.updated', task, previousTask, task.project_id);
      
      // Check if task was completed
      if (task.status === 'completed' && previousTask.status !== 'completed') {
        await triggerWebhooksForEvent('task.completed', task, previousTask, task.project_id);
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
        return;
      }
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }

  async updateTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = updateStatusSchema.parse(req.body);
      
      // Get previous task state for webhook comparison
      const previousTask = await taskService.getTaskById(id);
      if (!previousTask) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      const task = await taskService.updateTaskStatus(id, status, notes);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      // Trigger webhooks for task update
      await triggerWebhooksForEvent('task.updated', task, previousTask, task.project_id);
      
      // Check if task was completed
      if (task.status === 'completed' && previousTask.status !== 'completed') {
        await triggerWebhooksForEvent('task.completed', task, previousTask, task.project_id);
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
        return;
      }
      console.error('Error updating task status:', error);
      res.status(500).json({ error: 'Failed to update task status' });
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Get task data before deletion for webhook
      const task = await taskService.getTaskById(id);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      const deleted = await taskService.deleteTask(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      // Trigger webhooks for task deletion
      await triggerWebhooksForEvent('task.deleted', task, undefined, task.project_id);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }

  async getTaskHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const history = await taskService.getTaskHistory(id);
      res.json(history);
    } catch (error) {
      console.error('Error fetching task history:', error);
      res.status(500).json({ error: 'Failed to fetch task history' });
    }
  }

  async addTestResult(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = addTestResultSchema.parse(req.body);
      const result = await taskService.addTestResult({
        task_id: id,
        ...data
      });
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
        return;
      }
      console.error('Error adding test result:', error);
      res.status(500).json({ error: 'Failed to add test result' });
    }
  }

  async getTestResults(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const results = await taskService.getTestResults(id);
      res.json(results);
    } catch (error) {
      console.error('Error fetching test results:', error);
      res.status(500).json({ error: 'Failed to fetch test results' });
    }
  }

  async getNextTask(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.query;
      const task = await taskService.getNextTask(projectId as string);
      
      if (!task) {
        res.json({ message: 'No pending tasks found' });
        return;
      }
      
      res.json(task);
    } catch (error) {
      console.error('Error fetching next task:', error);
      res.status(500).json({ error: 'Failed to fetch next task' });
    }
  }
}