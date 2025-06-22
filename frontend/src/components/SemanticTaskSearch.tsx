import React, { useState, useEffect, useRef } from 'react';
import { Search, Brain, Filter, X, ArrowRight, Clock } from 'lucide-react';
import { mcpService, SemanticSearchResult } from '../services/mcpService';
import { Project } from '../types';

interface SemanticTaskSearchProps {
  projects: Project[];
  onTaskSelect?: (taskId: string) => void;
  placeholder?: string;
  className?: string;
}

export const SemanticTaskSearch: React.FC<SemanticTaskSearchProps> = ({
  projects,
  onTaskSelect,
  placeholder = "Search tasks with natural language...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [includeCompleted, setIncludeCompleted] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<'high' | 'medium' | 'low' | ''>('');

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await mcpService.intelligentTaskSearch(searchQuery, {
        projectId: selectedProject || undefined,
        includeCompleted,
        priority: priorityFilter || undefined,
        limit: 10
      });

      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    performSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const handleTaskSelect = (taskId: string) => {
    setShowResults(false);
    setQuery('');
    if (onTaskSelect) {
      onTaskSelect(taskId);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'blocked': return 'text-red-600 bg-red-50';
      case 'testing': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Brain className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query && setShowResults(true)}
            placeholder={placeholder}
            className="block w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 mr-1 rounded-lg transition-colors ${
                showFilters ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={loading}
              className="p-2 mr-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as 'high' | 'medium' | 'low' | '')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={includeCompleted}
                  onChange={(e) => setIncludeCompleted(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Include Completed
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-20">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Brain className="w-5 h-5 animate-pulse text-blue-500 mr-2" />
              <span className="text-gray-600 dark:text-gray-300">Searching with AI...</span>
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No tasks found matching your search</p>
              <p className="text-sm mt-1">Try different keywords or check your filters</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Found {results.length} relevant tasks
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Powered by AI semantic search
                  </span>
                </div>
              </div>

              {results.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleTaskSelect(result.id)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {result.content.split('\n')[0]}
                        </h4>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${getScoreColor(result.score)}`}>
                          {Math.round(result.score * 100)}% match
                        </span>
                      </div>

                      {result.content.split('\n')[1] && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {result.content.split('\n').slice(1).join(' ')}
                        </p>
                      )}

                      <div className="flex items-center space-x-2 text-xs">
                        {result.metadata?.project_name && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            {result.metadata.project_name}
                          </span>
                        )}
                        {result.metadata?.status && (
                          <span className={`px-2 py-1 rounded ${getStatusColor(result.metadata.status)}`}>
                            {result.metadata.status}
                          </span>
                        )}
                        {result.metadata?.priority && (
                          <span className={`px-2 py-1 rounded ${getScoreColor(
                            result.metadata.priority === 'high' ? 1 : 
                            result.metadata.priority === 'medium' ? 0.7 : 0.4
                          )}`}>
                            {result.metadata.priority} priority
                          </span>
                        )}
                        {result.metadata?.updated_at && (
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{formatDate(result.metadata.updated_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};