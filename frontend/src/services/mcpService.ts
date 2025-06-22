import { api } from './api';

export interface EntityData {
  id: string;
  name: string;
  type: 'task' | 'project' | 'user' | 'keyword';
  description?: string;
  properties?: Record<string, unknown>;
}

export interface TaskSuggestion {
  type: 'similar_task' | 'dependency' | 'resource' | 'best_practice';
  title: string;
  description: string;
  confidence: number;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface SemanticSearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: {
    project_name?: string;
    status?: string;
    priority?: string;
    updated_at?: string;
    [key: string]: unknown;
  };
}

export interface AIProcessingResult {
  task_id: string;
  entities: EntityData[];
  suggestions: TaskSuggestion[];
  similar_tasks: SemanticSearchResult[];
  processed_at: string;
}

export interface McpHealthStatus {
  overall_healthy: boolean;
  services: {
    knowledgeGraph: boolean;
    rag: boolean;
    vectorDb: boolean;
    unifiedDb: boolean;
  };
  checked_at: string;
}

export class McpService {
  
  /**
   * Process a task with comprehensive AI analysis
   */
  async processTaskWithAI(taskId: string, workspaceId: string): Promise<AIProcessingResult> {
    const response = await api.post(`/mcp/tasks/${taskId}/process`, { workspaceId });
    return response.data.data;
  }

  /**
   * Get AI-powered suggestions for a task
   */
  async getTaskSuggestions(taskId: string): Promise<TaskSuggestion[]> {
    const response = await api.get(`/mcp/tasks/${taskId}/suggestions`);
    return response.data.data.suggestions;
  }

  /**
   * Perform semantic search across tasks
   */
  async searchTasks(query: string, projectId?: string, limit: number = 10): Promise<{
    query: string;
    results: SemanticSearchResult[];
    total: number;
    searched_at: string;
  }> {
    const response = await api.post('/mcp/tasks/search', {
      query,
      projectId,
      limit
    });
    return response.data.data;
  }

  /**
   * Find similar tasks using vector similarity
   */
  async findSimilarTasks(taskId: string, limit: number = 5): Promise<SemanticSearchResult[]> {
    const response = await api.post(`/mcp/tasks/${taskId}/similar`, { limit });
    return response.data.data.similar_tasks;
  }

  /**
   * Extract entities from a task
   */
  async extractTaskEntities(taskId: string): Promise<EntityData[]> {
    const response = await api.get(`/mcp/tasks/${taskId}/entities`);
    return response.data.data.entities;
  }

  /**
   * Create a relationship between two tasks
   */
  async createTaskRelationship(
    sourceTaskId: string, 
    targetTaskId: string, 
    relationshipType: 'depends_on' | 'relates_to' | 'blocks' | 'part_of'
  ): Promise<{
    source_task_id: string;
    target_task_id: string;
    relationship_type: string;
    created_at: string;
  }> {
    const response = await api.post('/mcp/tasks/relationships', {
      sourceTaskId,
      targetTaskId,
      relationshipType
    });
    return response.data.data;
  }

  /**
   * Check health status of all MCP services
   */
  async getHealthStatus(): Promise<McpHealthStatus> {
    const response = await api.get('/mcp/health');
    return response.data.data;
  }

  /**
   * Batch process multiple tasks with AI analysis
   */
  async batchProcessTasks(taskIds: string[], workspaceId: string): Promise<{
    processed: number;
    error_count: number;
    results: AIProcessingResult[];
    errors: Array<{ taskId: string; error: string }>;
    processed_at: string;
  }> {
    const response = await api.post('/mcp/tasks/batch-process', {
      taskIds,
      workspaceId
    });
    return response.data.data;
  }

  /**
   * Get intelligent task insights combining multiple AI features
   */
  async getTaskInsights(taskId: string, workspaceId: string): Promise<{
    entities: EntityData[];
    suggestions: TaskSuggestion[];
    similarTasks: SemanticSearchResult[];
    isProcessing: boolean;
  }> {
    try {
      // First try to get cached results or trigger processing
      const result = await this.processTaskWithAI(taskId, workspaceId);
      
      return {
        entities: result.entities,
        suggestions: result.suggestions,
        similarTasks: result.similar_tasks,
        isProcessing: false
      };
    } catch (error) {
      console.warn('Failed to get task insights:', error);
      return {
        entities: [],
        suggestions: [],
        similarTasks: [],
        isProcessing: true
      };
    }
  }

  /**
   * Search for tasks with intelligent ranking
   */
  async intelligentTaskSearch(query: string, options?: {
    projectId?: string;
    includeCompleted?: boolean;
    priority?: 'high' | 'medium' | 'low';
    limit?: number;
  }): Promise<SemanticSearchResult[]> {
    const searchQuery = options?.priority ? `${query} priority:${options.priority}` : query;
    
    const result = await this.searchTasks(
      searchQuery, 
      options?.projectId, 
      options?.limit
    );

    // Filter by completion status if specified
    if (options?.includeCompleted === false) {
      return result.results.filter(item => 
        !item.metadata?.status || item.metadata.status !== 'completed'
      );
    }

    return result.results;
  }

  /**
   * Get task recommendations based on current context
   */
  async getTaskRecommendations(currentTaskId: string): Promise<{
    nextTasks: TaskSuggestion[];
    relatedTasks: SemanticSearchResult[];
    blockedBy: string[];
  }> {
    try {
      // Get suggestions and similar tasks in parallel
      const [suggestions, similarTasks] = await Promise.all([
        this.getTaskSuggestions(currentTaskId),
        this.findSimilarTasks(currentTaskId)
      ]);

      // Filter suggestions for next task recommendations
      const nextTasks = suggestions.filter(s => 
        s.type === 'dependency' || s.type === 'similar_task'
      );

      // Extract potential blockers from suggestions
      const blockedBy = suggestions
        .filter(s => s.type === 'dependency' && s.metadata?.blocks)
        .map(s => s.metadata?.taskId)
        .filter((taskId): taskId is string => typeof taskId === 'string');

      return {
        nextTasks,
        relatedTasks: similarTasks,
        blockedBy
      };
    } catch (error) {
      console.error('Failed to get task recommendations:', error);
      return {
        nextTasks: [],
        relatedTasks: [],
        blockedBy: []
      };
    }
  }
}

export const mcpService = new McpService();