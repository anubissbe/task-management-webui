import { Router } from 'express';
import { mcpController } from '../controllers/mcpController';
import { authenticate } from '../middleware/auth';
import { workspaceContext } from '../middleware/workspace';

const router = Router();

// Apply authentication middleware to all MCP routes
router.use(authenticate);

// Apply workspace middleware to routes that need workspace validation
router.use(workspaceContext);

/**
 * @route POST /api/mcp/tasks/:taskId/process
 * @desc Process a task with AI analysis (entities, suggestions, similar tasks)
 * @access Private
 * @body { workspaceId: string }
 */
router.post('/tasks/:taskId/process', mcpController.processTaskWithAI);

/**
 * @route GET /api/mcp/tasks/:taskId/suggestions
 * @desc Get AI-powered suggestions for a task
 * @access Private
 */
router.get('/tasks/:taskId/suggestions', mcpController.getTaskSuggestions);

/**
 * @route POST /api/mcp/tasks/search
 * @desc Semantic search for tasks using RAG
 * @access Private
 * @body { query: string, projectId?: string, limit?: number }
 */
router.post('/tasks/search', mcpController.searchTasks);

/**
 * @route POST /api/mcp/tasks/:taskId/similar
 * @desc Find similar tasks using vector similarity
 * @access Private
 * @body { limit?: number }
 */
router.post('/tasks/:taskId/similar', mcpController.findSimilarTasks);

/**
 * @route GET /api/mcp/tasks/:taskId/entities
 * @desc Extract entities from a task using knowledge graph
 * @access Private
 */
router.get('/tasks/:taskId/entities', mcpController.extractTaskEntities);

/**
 * @route POST /api/mcp/tasks/relationships
 * @desc Create a relationship between two tasks
 * @access Private
 * @body { sourceTaskId: string, targetTaskId: string, relationshipType: string }
 */
router.post('/tasks/relationships', mcpController.createTaskRelationship);

/**
 * @route GET /api/mcp/health
 * @desc Check health status of all MCP services
 * @access Private
 */
router.get('/health', mcpController.getHealthStatus);

/**
 * @route POST /api/mcp/tasks/batch-process
 * @desc Batch process multiple tasks with AI analysis
 * @access Private
 * @body { taskIds: string[], workspaceId: string }
 */
router.post('/tasks/batch-process', mcpController.batchProcessTasks);

export default router;