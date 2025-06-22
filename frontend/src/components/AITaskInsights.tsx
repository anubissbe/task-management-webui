import React, { useState, useEffect } from 'react';
import { Brain, Network, Lightbulb, Users, Link, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { mcpService, EntityData, TaskSuggestion, SemanticSearchResult } from '../services/mcpService';
import { Task } from '../types';

interface AITaskInsightsProps {
  task: Task;
  workspaceId: string;
  onTaskSelect?: (taskId: string) => void;
  onCreateRelationship?: (sourceId: string, targetId: string, type: string) => void;
}

export const AITaskInsights: React.FC<AITaskInsightsProps> = ({
  task,
  workspaceId,
  onTaskSelect,
  onCreateRelationship
}) => {
  const [insights, setInsights] = useState<{
    entities: EntityData[];
    suggestions: TaskSuggestion[];
    similarTasks: SemanticSearchResult[];
    isProcessing: boolean;
  }>({
    entities: [],
    suggestions: [],
    similarTasks: [],
    isProcessing: true
  });

  const [expandedSections, setExpandedSections] = useState<{
    entities: boolean;
    suggestions: boolean;
    similar: boolean;
  }>({
    entities: true,
    suggestions: true,
    similar: false
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTaskInsights();
  }, [task.id, workspaceId]);

  const loadTaskInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mcpService.getTaskInsights(task.id, workspaceId);
      setInsights(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI insights');
      console.error('Error loading task insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCreateRelationship = async (targetTaskId: string, type: string) => {
    try {
      await mcpService.createTaskRelationship(task.id, targetTaskId, type as any);
      if (onCreateRelationship) {
        onCreateRelationship(task.id, targetTaskId, type);
      }
      // Refresh insights to show new relationships
      await loadTaskInsights();
    } catch (err: any) {
      console.error('Failed to create relationship:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-600 dark:text-gray-300">Analyzing task with AI...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-red-600">
            <Brain className="w-5 h-5 mr-2" />
            <span className="font-medium">AI Analysis Failed</span>
          </div>
          <button
            onClick={loadTaskInsights}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Retry
          </button>
        </div>
        <p className="text-red-500 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Task Insights
            </h3>
          </div>
          {insights.isProcessing && (
            <div className="flex items-center text-blue-500">
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
              <span className="text-sm">Processing...</span>
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Entities Section */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('entities')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <Network className="w-4 h-4 text-purple-500 mr-2" />
              <span className="font-medium text-gray-900 dark:text-white">
                Extracted Entities ({insights.entities.length})
              </span>
            </div>
            {expandedSections.entities ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.entities && (
            <div className="mt-3 space-y-2">
              {insights.entities.length === 0 ? (
                <p className="text-gray-500 text-sm">No entities detected</p>
              ) : (
                insights.entities.map((entity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {entity.name}
                      </span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded ${getPriorityColor(entity.type)}`}>
                        {entity.type}
                      </span>
                    </div>
                    {entity.description && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {entity.description}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Suggestions Section */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('suggestions')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="font-medium text-gray-900 dark:text-white">
                AI Suggestions ({insights.suggestions.length})
              </span>
            </div>
            {expandedSections.suggestions ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.suggestions && (
            <div className="mt-3 space-y-3">
              {insights.suggestions.length === 0 ? (
                <p className="text-gray-500 text-sm">No suggestions available</p>
              ) : (
                insights.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {suggestion.title}
                          </span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${getConfidenceColor(suggestion.confidence)}`}>
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded">
                            {suggestion.type.replace('_', ' ')}
                          </span>
                          <span className="ml-2">via {suggestion.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Similar Tasks Section */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('similar')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <Users className="w-4 h-4 text-green-500 mr-2" />
              <span className="font-medium text-gray-900 dark:text-white">
                Similar Tasks ({insights.similarTasks.length})
              </span>
            </div>
            {expandedSections.similar ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.similar && (
            <div className="mt-3 space-y-3">
              {insights.similarTasks.length === 0 ? (
                <p className="text-gray-500 text-sm">No similar tasks found</p>
              ) : (
                insights.similarTasks.map((similarTask, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {similarTask.content.split('\n')[0]}
                          </span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${getConfidenceColor(similarTask.score)}`}>
                            {Math.round(similarTask.score * 100)}% match
                          </span>
                        </div>
                        {similarTask.content.split('\n')[1] && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {similarTask.content.split('\n')[1]}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {similarTask.metadata?.project_name && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                {similarTask.metadata.project_name}
                              </span>
                            )}
                            {similarTask.metadata?.status && (
                              <span className={`px-2 py-1 rounded ${getPriorityColor(similarTask.metadata.status)}`}>
                                {similarTask.metadata.status}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {onTaskSelect && (
                              <button
                                onClick={() => onTaskSelect(similarTask.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                View Task
                              </button>
                            )}
                            <button
                              onClick={() => handleCreateRelationship(similarTask.id, 'relates_to')}
                              className="text-green-600 hover:text-green-700 text-sm flex items-center"
                            >
                              <Link className="w-3 h-3 mr-1" />
                              Link
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Powered by Knowledge Graph, RAG, and Vector Search
          </span>
          <button
            onClick={loadTaskInsights}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Refresh Analysis
          </button>
        </div>
      </div>
    </div>
  );
};