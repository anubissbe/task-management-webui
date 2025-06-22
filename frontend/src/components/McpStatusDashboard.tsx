import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, RefreshCw, Brain, Search, Database, Network } from 'lucide-react';
import { mcpService, McpHealthStatus } from '../services/mcpService';

interface McpStatusDashboardProps {
  className?: string;
  showDetails?: boolean;
}

export const McpStatusDashboard: React.FC<McpStatusDashboardProps> = ({
  className = "",
  showDetails = true
}) => {
  const [healthStatus, setHealthStatus] = useState<McpHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    checkHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const status = await mcpService.getHealthStatus();
      setHealthStatus(status);
      setLastChecked(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to check MCP services health');
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getServiceConfig = (serviceName: keyof McpHealthStatus['services']) => {
    const configs = {
      knowledgeGraph: {
        name: 'Knowledge Graph',
        description: 'Entity extraction and relationships',
        icon: Network,
        color: 'purple'
      },
      rag: {
        name: 'RAG Search',
        description: 'Document retrieval and indexing',
        icon: Search,
        color: 'blue'
      },
      vectorDb: {
        name: 'Vector Database',
        description: 'Embeddings and similarity search',
        icon: Database,
        color: 'green'
      },
      unifiedDb: {
        name: 'Unified Database',
        description: 'Multi-database abstraction',
        icon: Database,
        color: 'orange'
      }
    };
    return configs[serviceName];
  };

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  const getStatusIcon = (isHealthy: boolean) => {
    return isHealthy ? CheckCircle : AlertCircle;
  };

  if (loading && !healthStatus) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-600 dark:text-gray-300">Checking MCP services...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              MCP Services Status
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {healthStatus && (
              <div className="flex items-center">
                <Activity className={`w-4 h-4 mr-1 ${healthStatus.overall_healthy ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm font-medium ${healthStatus.overall_healthy ? 'text-green-600' : 'text-red-600'}`}>
                  {healthStatus.overall_healthy ? 'All Systems Operational' : 'Service Issues Detected'}
                </span>
              </div>
            )}
            <button
              onClick={checkHealth}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            </div>
          </div>
        )}

        {healthStatus && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className={`p-4 rounded-lg border ${
              healthStatus.overall_healthy 
                ? 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className={`w-5 h-5 mr-2 ${healthStatus.overall_healthy ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={`font-medium ${healthStatus.overall_healthy ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                    System Status: {healthStatus.overall_healthy ? 'Healthy' : 'Degraded'}
                  </span>
                </div>
                {lastChecked && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Last checked: {lastChecked.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* Individual Services */}
            {showDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(healthStatus.services).map(([serviceName, isHealthy]) => {
                  const config = getServiceConfig(serviceName as keyof McpHealthStatus['services']);
                  const StatusIcon = getStatusIcon(isHealthy);
                  const IconComponent = config.icon;

                  return (
                    <div
                      key={serviceName}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className={`p-2 rounded-lg mr-3 bg-${config.color}-100 dark:bg-${config.color}-900/50`}>
                            <IconComponent className={`w-5 h-5 text-${config.color}-600 dark:text-${config.color}-400`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {config.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {config.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <StatusIcon className={`w-5 h-5 ${isHealthy ? 'text-green-500' : 'text-red-500'}`} />
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(isHealthy)}`}>
                          {isHealthy ? 'Operational' : 'Unavailable'}
                        </span>
                        {isHealthy && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Ready for requests
                          </span>
                        )}
                        {!isHealthy && (
                          <span className="text-xs text-red-500">
                            Service unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Service Capabilities */}
            {showDetails && healthStatus.overall_healthy && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Available AI Capabilities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2" />
                    Entity extraction from tasks
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2" />
                    Semantic task search
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2" />
                    Similar task recommendations
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2" />
                    Task relationship mapping
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2" />
                    AI-powered task suggestions
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2" />
                    Vector similarity search
                  </div>
                </div>
              </div>
            )}

            {/* Degraded Service Warning */}
            {!healthStatus.overall_healthy && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Limited AI Features Available
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Some MCP services are unavailable. Core task management features continue to work normally, 
                      but AI-powered insights and recommendations may be limited.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};