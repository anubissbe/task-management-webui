import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';
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
  estimated_hours: z.number().positive().optional()
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
  verification_steps: z.string().optional()
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
      const task = await taskService.updateTask(id, data);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
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
      const task = await taskService.updateTaskStatus(id, status, notes);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
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
      const deleted = await taskService.deleteTask(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
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