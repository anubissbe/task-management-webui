import { Request, Response } from 'express';
import { mcpIntegrationService } from '../services/mcpIntegrationService';
import { TaskService } from '../services/taskService';
import { ProjectService } from '../services/projectService';

export class McpController {
  private taskService = new TaskService();
  private projectService = new ProjectService();

  // Process task with AI analysis
  async processTaskWithAI(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { workspaceId } = req.body;

      if (!taskId || !workspaceId) {
        res.status(400).json({ 
          error: 'Missing required parameters: taskId and workspaceId' 
        });
        return;
      }

      // Get task details
      const task = await this.taskService.getTaskById(taskId);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      // Get project details
      const project = await this.projectService.getProjectById(task.project_id, workspaceId);
      if (!project) {
        res.status(404).json({ error: 'Project not found or access denied' });
        return;
      }

      // Process with AI
      const results = await mcpIntegrationService.processTaskWithAI(task, project);

      res.json({
        success: results.success,
        data: {
          task_id: taskId,
          entities: results.entities,
          suggestions: results.suggestions,
          similar_tasks: results.similarTasks,
          processed_at: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('MCP task processing error:', error);
      res.status(500).json({ 
        error: 'Failed to process task with AI',
        details: error.message 
      });
    }
  }

  // Get task suggestions
  async getTaskSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;

      const task = await this.taskService.getTaskById(taskId);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      const suggestions = await mcpIntegrationService.getTaskSuggestions(task);

      res.json({
        success: true,
        data: {
          task_id: taskId,
          suggestions,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Task suggestions error:', error);
      res.status(500).json({ 
        error: 'Failed to get task suggestions',
        details: error.message 
      });
    }
  }

  // Search tasks semantically
  async searchTasks(req: Request, res: Response): Promise<void> {
    try {
      const { query, projectId, limit = 10 } = req.body;

      if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const results = await mcpIntegrationService.searchRelevantTasks(query, projectId);

      res.json({
        success: true,
        data: {
          query,
          results: results.slice(0, limit),
          total: results.length,
          searched_at: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Semantic search error:', error);
      res.status(500).json({ 
        error: 'Failed to search tasks',
        details: error.message 
      });
    }
  }

  // Find similar tasks using vector similarity
  async findSimilarTasks(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { limit = 5 } = req.body;

      const similarTasks = await mcpIntegrationService.findSimilarTasksByVector(taskId, limit);

      res.json({
        success: true,
        data: {
          task_id: taskId,
          similar_tasks: similarTasks,
          found_at: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Similar tasks search error:', error);
      res.status(500).json({ 
        error: 'Failed to find similar tasks',
        details: error.message 
      });
    }
  }

  // Extract entities from task
  async extractTaskEntities(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;

      const task = await this.taskService.getTaskById(taskId);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      const entities = await mcpIntegrationService.extractEntitiesFromTask(task);

      res.json({
        success: true,
        data: {
          task_id: taskId,
          entities,
          extracted_at: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Entity extraction error:', error);
      res.status(500).json({ 
        error: 'Failed to extract entities',
        details: error.message 
      });
    }
  }

  // Create relationship between tasks
  async createTaskRelationship(req: Request, res: Response): Promise<void> {
    try {
      const { sourceTaskId, targetTaskId, relationshipType } = req.body;

      if (!sourceTaskId || !targetTaskId || !relationshipType) {
        res.status(400).json({ 
          error: 'Missing required parameters: sourceTaskId, targetTaskId, relationshipType' 
        });
        return;
      }

      // Validate tasks exist
      const [sourceTask, targetTask] = await Promise.all([
        this.taskService.getTaskById(sourceTaskId),
        this.taskService.getTaskById(targetTaskId)
      ]);

      if (!sourceTask || !targetTask) {
        res.status(404).json({ error: 'One or both tasks not found' });
        return;
      }

      const success = await mcpIntegrationService.createTaskRelationship(
        sourceTaskId, 
        targetTaskId, 
        relationshipType
      );

      if (success) {
        res.json({
          success: true,
          data: {
            source_task_id: sourceTaskId,
            target_task_id: targetTaskId,
            relationship_type: relationshipType,
            created_at: new Date().toISOString()
          }
        });
      } else {
        res.status(500).json({ error: 'Failed to create relationship' });
      }
    } catch (error: any) {
      console.error('Relationship creation error:', error);
      res.status(500).json({ 
        error: 'Failed to create task relationship',
        details: error.message 
      });
    }
  }

  // Get MCP health status
  async getHealthStatus(_req: Request, res: Response): Promise<void> {
    try {
      const healthStatus = await mcpIntegrationService.healthCheck();

      const overallHealth = Object.values(healthStatus).every(status => status);

      res.json({
        success: true,
        data: {
          overall_healthy: overallHealth,
          services: healthStatus,
          checked_at: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Health check error:', error);
      res.status(500).json({ 
        error: 'Failed to check MCP services health',
        details: error.message 
      });
    }
  }

  // Batch process multiple tasks
  async batchProcessTasks(req: Request, res: Response): Promise<void> {
    try {
      const { taskIds, workspaceId } = req.body;

      if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
        res.status(400).json({ error: 'taskIds must be a non-empty array' });
        return;
      }

      if (!workspaceId) {
        res.status(400).json({ error: 'workspaceId is required' });
        return;
      }

      const results: any[] = [];
      const errors: Array<{ taskId: string; error: string }> = [];

      // Process tasks in batches of 5 to avoid overwhelming the MCP servers
      const batchSize = 5;
      for (let i = 0; i < taskIds.length; i += batchSize) {
        const batch = taskIds.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (taskId: string) => {
          try {
            const task = await this.taskService.getTaskById(taskId);
            if (!task) {
              throw new Error(`Task ${taskId} not found`);
            }

            const project = await this.projectService.getProjectById(task.project_id, workspaceId);
            if (!project) {
              throw new Error(`Project for task ${taskId} not found or access denied`);
            }

            const result = await mcpIntegrationService.processTaskWithAI(task, project);
            return { taskId, ...result };
          } catch (error: any) {
            errors.push({ taskId, error: error.message });
            return null;
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            results.push(result.value);
          } else if (result.status === 'rejected') {
            errors.push({ taskId: batch[index], error: result.reason });
          }
        });
      }

      res.json({
        success: true,
        data: {
          processed: results.length,
          error_count: errors.length,
          results,
          errors,
          processed_at: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Batch processing error:', error);
      res.status(500).json({ 
        error: 'Failed to batch process tasks',
        details: error.message 
      });
    }
  }
}

export const mcpController = new McpController();