import axios from 'axios';
import { Task, Project } from '../types';

export interface EntityData {
  id: string;
  name: string;
  type: 'task' | 'project' | 'user' | 'keyword';
  description?: string;
  properties?: Record<string, any>;
}

export interface Relationship {
  id: string;
  source_id: string;
  target_id: string;
  type: 'depends_on' | 'relates_to' | 'assigned_to' | 'blocks' | 'part_of';
  weight?: number;
  metadata?: Record<string, any>;
}

export interface SemanticSearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface TaskSuggestion {
  type: 'similar_task' | 'dependency' | 'resource' | 'best_practice';
  title: string;
  description: string;
  confidence: number;
  source: string;
  metadata?: Record<string, any>;
}

export class McpIntegrationService {
  private readonly knowledgeGraphUrl = 'http://192.168.1.24:8001';
  private readonly ragUrl = 'http://192.168.1.24:8002';
  private readonly vectorDbUrl = 'http://192.168.1.24:8003';
  private readonly unifiedDbUrl = 'http://192.168.1.24:8004';

  // Knowledge Graph Integration
  async extractEntitiesFromTask(task: Task): Promise<EntityData[]> {
    try {
      const response = await axios.post(`${this.knowledgeGraphUrl}/api/extract-entities`, {
        text: `${task.name} ${task.description || ''}`,
        context: {
          type: 'task',
          id: task.id,
          project_id: task.project_id,
          priority: task.priority,
          status: task.status
        }
      }, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });

      return response.data.entities || [];
    } catch (error) {
      console.error('Knowledge Graph entity extraction failed:', error);
      return [];
    }
  }

  async findRelatedTasks(taskId: string, _projectId: string): Promise<Task[]> {
    try {
      const response = await axios.post(`${this.knowledgeGraphUrl}/api/find-relationships`, {
        entity_id: taskId,
        entity_type: 'task',
        relationship_types: ['depends_on', 'relates_to', 'blocks'],
        max_results: 10
      }, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });

      // Convert knowledge graph results to task IDs and fetch full task data
      const relatedTaskIds = response.data.relationships?.map((rel: any) => 
        rel.source_id === taskId ? rel.target_id : rel.source_id
      ) || [];

      if (relatedTaskIds.length === 0) {
        return [];
      }

      // Fetch full task details from database
      // This would need to be implemented with proper database queries
      return [];
    } catch (error) {
      console.error('Knowledge Graph relationship finding failed:', error);
      return [];
    }
  }

  async createTaskRelationship(sourceTaskId: string, targetTaskId: string, type: string): Promise<boolean> {
    try {
      await axios.post(`${this.knowledgeGraphUrl}/api/create-relationship`, {
        source_id: sourceTaskId,
        target_id: targetTaskId,
        type,
        metadata: {
          created_by: 'projecthub-mcp',
          created_at: new Date().toISOString()
        }
      }, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });

      return true;
    } catch (error) {
      console.error('Knowledge Graph relationship creation failed:', error);
      return false;
    }
  }

  // RAG Integration
  async indexTaskForSearch(task: Task, project: Project): Promise<boolean> {
    try {
      const document = {
        id: task.id,
        content: `${task.name}\n${task.description || ''}\n${task.implementation_notes || ''}`,
        metadata: {
          type: 'task',
          project_id: task.project_id,
          project_name: project.name,
          status: task.status,
          priority: task.priority,
          created_at: task.created_at,
          updated_at: task.updated_at,
          tags: [task.status, task.priority, project.name.toLowerCase().replace(/\s+/g, '-')]
        }
      };

      await axios.post(`${this.ragUrl}/api/index-document`, document, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });

      return true;
    } catch (error) {
      console.error('RAG document indexing failed:', error);
      return false;
    }
  }

  async searchRelevantTasks(query: string, projectId?: string): Promise<SemanticSearchResult[]> {
    try {
      const response = await axios.post(`${this.ragUrl}/api/search`, {
        query,
        filters: projectId ? { project_id: projectId } : {},
        limit: 10,
        include_metadata: true
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });

      return response.data.results || [];
    } catch (error) {
      console.error('RAG search failed:', error);
      return [];
    }
  }

  async getTaskSuggestions(task: Task): Promise<TaskSuggestion[]> {
    try {
      const suggestions: TaskSuggestion[] = [];

      // Search for similar tasks
      const similarTasks = await this.searchRelevantTasks(
        `${task.name} ${task.description || ''}`,
        task.project_id
      );

      similarTasks.forEach(result => {
        if (result.id !== task.id && result.score > 0.7) {
          suggestions.push({
            type: 'similar_task',
            title: `Similar task found`,
            description: `Found similar task: "${result.content.split('\n')[0]}" (${Math.round(result.score * 100)}% match)`,
            confidence: result.score,
            source: 'rag_search',
            metadata: result.metadata
          });
        }
      });

      // Search for best practices
      const bestPractices = await this.searchRelevantTasks(
        `best practices ${task.priority} priority ${task.status} status`,
        undefined
      );

      bestPractices.forEach(result => {
        if (result.score > 0.6) {
          suggestions.push({
            type: 'best_practice',
            title: `Best practice suggestion`,
            description: `Consider best practices from: "${result.content.split('\n')[0]}"`,
            confidence: result.score,
            source: 'rag_search',
            metadata: result.metadata
          });
        }
      });

      return suggestions.slice(0, 5); // Return top 5 suggestions
    } catch (error) {
      console.error('Task suggestions generation failed:', error);
      return [];
    }
  }

  // Vector DB Integration
  async generateTaskEmbedding(task: Task): Promise<number[] | null> {
    try {
      const text = `${task.name}\n${task.description || ''}\n${task.implementation_notes || ''}`;
      
      const response = await axios.post(`${this.vectorDbUrl}/api/generate-embedding`, {
        text,
        model: 'text-embedding-ada-002' // or your preferred model
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });

      return response.data.embedding || null;
    } catch (error) {
      console.error('Vector embedding generation failed:', error);
      return null;
    }
  }

  async storeTaskEmbedding(taskId: string, embedding: number[], metadata: Record<string, any>): Promise<boolean> {
    try {
      await axios.post(`${this.vectorDbUrl}/api/store-embedding`, {
        id: taskId,
        embedding,
        metadata: {
          type: 'task',
          ...metadata,
          indexed_at: new Date().toISOString()
        }
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });

      return true;
    } catch (error) {
      console.error('Vector embedding storage failed:', error);
      return false;
    }
  }

  async findSimilarTasksByVector(taskId: string, limit: number = 5): Promise<SemanticSearchResult[]> {
    try {
      const response = await axios.post(`${this.vectorDbUrl}/api/similarity-search`, {
        id: taskId,
        limit,
        threshold: 0.5 // Only return results with >50% similarity
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });

      return response.data.results || [];
    } catch (error) {
      console.error('Vector similarity search failed:', error);
      return [];
    }
  }

  // Unified DB Integration for Cross-Database Operations
  async syncTaskToUnifiedStore(task: Task, project: Project): Promise<boolean> {
    try {
      await axios.post(`${this.unifiedDbUrl}/api/sync-record`, {
        id: task.id,
        type: 'task',
        data: task,
        metadata: {
          project: project,
          last_synced: new Date().toISOString()
        }
      }, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });

      return true;
    } catch (error) {
      console.error('Unified DB sync failed:', error);
      return false;
    }
  }

  // Combined MCP Operations
  async processTaskWithAI(task: Task, project: Project): Promise<{
    entities: EntityData[];
    suggestions: TaskSuggestion[];
    similarTasks: SemanticSearchResult[];
    success: boolean;
  }> {
    const results = {
      entities: [] as EntityData[],
      suggestions: [] as TaskSuggestion[],
      similarTasks: [] as SemanticSearchResult[],
      success: false
    };

    try {
      // Run AI processing operations in parallel for better performance
      const [entities, suggestions, similarTasks] = await Promise.allSettled([
        this.extractEntitiesFromTask(task),
        this.getTaskSuggestions(task),
        this.findSimilarTasksByVector(task.id)
      ]);

      if (entities.status === 'fulfilled') {
        results.entities = entities.value;
      }

      if (suggestions.status === 'fulfilled') {
        results.suggestions = suggestions.value;
      }

      if (similarTasks.status === 'fulfilled') {
        results.similarTasks = similarTasks.value;
      }

      // Index for future searches (fire and forget)
      this.indexTaskForSearch(task, project).catch(err => 
        console.warn('Background task indexing failed:', err)
      );

      // Generate and store embeddings (fire and forget)
      this.generateTaskEmbedding(task).then(embedding => {
        if (embedding) {
          this.storeTaskEmbedding(task.id, embedding, {
            project_id: task.project_id,
            priority: task.priority,
            status: task.status
          }).catch(err => console.warn('Background embedding storage failed:', err));
        }
      }).catch(err => console.warn('Background embedding generation failed:', err));

      // Sync to unified store (fire and forget)
      this.syncTaskToUnifiedStore(task, project).catch(err => 
        console.warn('Background unified sync failed:', err)
      );

      results.success = true;
      return results;
    } catch (error) {
      console.error('MCP task processing failed:', error);
      return results;
    }
  }

  // Health check for all MCP servers
  async healthCheck(): Promise<Record<string, boolean>> {
    const checks = {
      knowledgeGraph: false,
      rag: false,
      vectorDb: false,
      unifiedDb: false
    };

    const checkService = async (url: string, name: keyof typeof checks) => {
      try {
        await axios.get(`${url}/health`, { timeout: 3000 });
        checks[name] = true;
      } catch (error) {
        console.warn(`${name} health check failed:`, error);
      }
    };

    await Promise.allSettled([
      checkService(this.knowledgeGraphUrl, 'knowledgeGraph'),
      checkService(this.ragUrl, 'rag'),
      checkService(this.vectorDbUrl, 'vectorDb'),
      checkService(this.unifiedDbUrl, 'unifiedDb')
    ]);

    return checks;
  }
}

export const mcpIntegrationService = new McpIntegrationService();