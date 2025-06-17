import { useState, useMemo } from 'react';
import { ActivityEntry, Task, Project } from '../types';
import { getActivityColor } from '../utils/brandColors';

interface ActivityFeedProps {
  activities: ActivityEntry[];
  tasks: Task[];
  project?: Project;
  currentUser: string;
  showFilters?: boolean;
}

interface ActivityFilter {
  users: string[];
  actions: string[];
  dateRange: { start?: string; end?: string };
  tasks: string[];
}

export function ActivityFeed({ 
  activities, 
  tasks, 
  currentUser, 
  showFilters = true 
}: ActivityFeedProps) {
  const [filters, setFilters] = useState<ActivityFilter>({
    users: [],
    actions: [],
    dateRange: {},
    tasks: [],
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // Get unique users and actions for filters
  const { uniqueUsers, uniqueActions } = useMemo(() => {
    const users = Array.from(new Set(activities.map(a => a.user)));
    const actions = Array.from(new Set(activities.map(a => a.action)));
    return { uniqueUsers: users, uniqueActions: actions };
  }, [activities]);

  // Filter activities based on current filters
  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // Time range filter
    const now = new Date();
    let cutoffDate: Date;
    switch (timeRange) {
      case 'today':
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0);
    }

    filtered = filtered.filter(activity => new Date(activity.created_at) >= cutoffDate);

    // User filter
    if (filters.users.length > 0) {
      filtered = filtered.filter(activity => filters.users.includes(activity.user));
    }

    // Action filter
    if (filters.actions.length > 0) {
      filtered = filtered.filter(activity => filters.actions.includes(activity.action));
    }

    // Task filter
    if (filters.tasks.length > 0) {
      filtered = filtered.filter(activity => 
        activity.task_id && filters.tasks.includes(activity.task_id)
      );
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [activities, filters, timeRange]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityEntry[]> = {};
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    
    return groups;
  }, [filteredActivities]);

  const getActivityIcon = (action: string): string => {
    const icons: Record<string, string> = {
      created: '➕',
      updated: '✏️',
      commented: '💬',
      status_changed: '🔄',
      assigned: '👤',
      attached_file: '📎',
      dependency_added: '🔗',
      completed: '✅',
      started: '🚀',
      blocked: '🚫',
    };
    return icons[action] || '📝';
  };

  const getActivityColorClass = (action: string): string => {
    // Map status_changed to updated for color purposes
    const mappedAction = action === 'status_changed' ? 'updated' : action;
    return getActivityColor(mappedAction);
  };

  const formatActivityMessage = (activity: ActivityEntry): string => {
    const task = tasks.find(t => t.id === activity.task_id);
    const taskName = task?.name || 'Unknown Task';
    
    switch (activity.action) {
      case 'created':
        return `created task "${taskName}"`;
      case 'updated': {
        const changes = Object.keys(activity.details.changes || {});
        return `updated ${changes.join(', ')} in "${taskName}"`;
      }
      case 'commented':
        return `commented on "${taskName}"`;
      case 'status_changed':
        return `changed status of "${taskName}" from ${activity.details.from} to ${activity.details.to}`;
      case 'assigned':
        return `assigned "${taskName}" to ${activity.details.assignee}`;
      case 'attached_file':
        return `attached file "${activity.details.filename}" to "${taskName}"`;
      case 'dependency_added':
        return `added dependency to "${taskName}"`;
      default:
        return `performed ${activity.action} on "${taskName}"`;
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const toggleFilter = (type: keyof ActivityFilter, value: string) => {
    setFilters(prev => {
      const currentValues = prev[type] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [type]: newValues };
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              📈 Activity Feed
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredActivities.length} activities
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Time Range Filter */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'all' | 'today' | 'week' | 'month')}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="all">All Time</option>
            </select>
            
            {showFilters && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Filters {(filters.users.length + filters.actions.length + filters.tasks.length) > 0 && 
                  `(${filters.users.length + filters.actions.length + filters.tasks.length})`}
              </button>
            )}
          </div>
        </div>
        
        {/* Expanded Filters */}
        {isExpanded && showFilters && (
          <div className="mt-4 space-y-3">
            {/* User Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Users
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueUsers.map(user => (
                  <button
                    key={user}
                    onClick={() => toggleFilter('users', user)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      filters.users.includes(user)
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {user}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Actions
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueActions.map(action => (
                  <button
                    key={action}
                    onClick={() => toggleFilter('actions', action)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      filters.actions.includes(action)
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {getActivityIcon(action)} {action.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Activity List */}
      <div className="max-h-96 overflow-y-auto">
        {Object.keys(groupedActivities).length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📈</div>
            <p>No activity found for the selected filters.</p>
          </div>
        ) : (
          Object.entries(groupedActivities).map(([date, dayActivities]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="sticky top-0 bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
              </div>
              
              {/* Activities for this date */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {dayActivities.map((activity, index) => {
                  const isCurrentUser = activity.user === currentUser;
                  
                  return (
                    <div key={activity.id || index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start gap-3">
                        {/* Activity Icon */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColorClass(activity.action)}`}>
                          {getActivityIcon(activity.action)}
                        </div>
                        
                        {/* Activity Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              isCurrentUser 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {activity.user}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {formatActivityMessage(activity)}
                            </span>
                          </div>
                          
                          {/* Activity Details */}
                          {activity.details.comment && typeof activity.details.comment === 'string' ? (
                            <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-600 rounded text-sm text-gray-700 dark:text-gray-300">
                              "{activity.details.comment}"
                            </div>
                          ) : null}
                          
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(activity.created_at)}
                            </span>
                            
                            {activity.task_id && (
                              <button
                                onClick={() => {
                                  // Navigate to task - this would be implemented based on your routing
                                  console.log('Navigate to task:', activity.task_id);
                                }}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                View Task
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Activity Summary */}
      {filteredActivities.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {uniqueUsers.filter(user => filteredActivities.some(a => a.user === user)).length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {filteredActivities.filter(a => a.action === 'status_changed').length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Status Changes</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {filteredActivities.filter(a => a.action === 'commented').length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Comments</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}