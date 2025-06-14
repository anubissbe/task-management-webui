import { useState } from 'react';
import { TaskPriority, TaskStatus } from '../types';

interface TaskFiltersProps {
  onFiltersChange: (filters: TaskFilters) => void;
  taskCounts: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
}

export interface TaskFilters {
  search: string;
  status: TaskStatus[];
  priority: TaskPriority[];
  assignedTo: string;
  hasSubtasks: boolean | null;
  estimatedHours: { min?: number; max?: number };
  dateRange: { start?: string; end?: string };
}

const TASK_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'blocked', 'testing', 'completed', 'failed'];
const TASK_PRIORITIES: TaskPriority[] = ['critical', 'high', 'medium', 'low'];

const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
  testing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
};

export function TaskFilters({ onFiltersChange, taskCounts }: TaskFiltersProps) {
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: [],
    priority: [],
    assignedTo: '',
    hasSubtasks: null,
    estimatedHours: {},
    dateRange: {},
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (newFilters: Partial<TaskFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const clearFilters = () => {
    const clearedFilters: TaskFilters = {
      search: '',
      status: [],
      priority: [],
      assignedTo: '',
      hasSubtasks: null,
      estimatedHours: {},
      dateRange: {},
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFilterCount = [
    filters.search,
    filters.status.length > 0,
    filters.priority.length > 0,
    filters.assignedTo,
    filters.hasSubtasks !== null,
    filters.estimatedHours.min || filters.estimatedHours.max,
    filters.dateRange.start || filters.dateRange.end,
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      <div className="p-4">
        {/* Search and Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks by name, description, or notes..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            <svg className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Task Counts Summary */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Total: {taskCounts.total}</span>
          {Object.entries(taskCounts.byStatus).map(([status, count]) => (
            count > 0 && (
              <span key={status} className="capitalize">
                {status.replace('_', ' ')}: {count}
              </span>
            )
          ))}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {/* Status Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {TASK_STATUSES.map((status) => {
                  const isSelected = filters.status.includes(status);
                  const count = taskCounts.byStatus[status] || 0;
                  return (
                    <button
                      key={status}
                      onClick={() => {
                        const newStatus = isSelected
                          ? filters.status.filter(s => s !== status)
                          : [...filters.status, status];
                        updateFilters({ status: newStatus });
                      }}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        isSelected
                          ? `${STATUS_COLORS[status]} border-current`
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {status.replace('_', ' ')} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {TASK_PRIORITIES.map((priority) => {
                  const isSelected = filters.priority.includes(priority);
                  const count = taskCounts.byPriority[priority] || 0;
                  return (
                    <button
                      key={priority}
                      onClick={() => {
                        const newPriority = isSelected
                          ? filters.priority.filter(p => p !== priority)
                          : [...filters.priority, priority];
                        updateFilters({ priority: newPriority });
                      }}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        isSelected
                          ? `${PRIORITY_COLORS[priority]} border-current`
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {priority} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  placeholder="Username or email"
                  value={filters.assignedTo}
                  onChange={(e) => updateFilters({ assignedTo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Estimated Hours Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estimated Hours
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.estimatedHours.min || ''}
                    onChange={(e) => updateFilters({ 
                      estimatedHours: { 
                        ...filters.estimatedHours, 
                        min: e.target.value ? Number(e.target.value) : undefined 
                      } 
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.estimatedHours.max || ''}
                    onChange={(e) => updateFilters({ 
                      estimatedHours: { 
                        ...filters.estimatedHours, 
                        max: e.target.value ? Number(e.target.value) : undefined 
                      } 
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Has Subtasks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task Type
                </label>
                <select
                  value={filters.hasSubtasks === null ? '' : filters.hasSubtasks.toString()}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : e.target.value === 'true';
                    updateFilters({ hasSubtasks: value });
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Tasks</option>
                  <option value="true">Parent Tasks Only</option>
                  <option value="false">Simple Tasks Only</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}