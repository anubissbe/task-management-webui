import { useMemo } from 'react';
import { Task, Project } from '../types';

interface TaskAnalyticsProps {
  tasks: Task[];
  project?: Project;
}

interface Analytics {
  completion: {
    percentage: number;
    completed: number;
    total: number;
  };
  velocity: {
    tasksPerDay: number;
    recentCompletions: number;
  };
  timeTracking: {
    totalEstimated: number;
    totalActual: number;
    efficiency: number;
  };
  statusBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  blockedTasks: Task[];
  overdueEstimates: Task[];
}

export function TaskAnalytics({ tasks }: TaskAnalyticsProps) {
  const analytics: Analytics = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed');
    const blocked = tasks.filter(t => t.status === 'blocked');
    
    // Calculate recent completions (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentCompletions = completed.filter(t => 
      t.completed_at && new Date(t.completed_at) > weekAgo
    );

    // Time tracking
    const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
    const totalActual = tasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0);
    const efficiency = totalEstimated > 0 ? (totalEstimated / totalActual) * 100 : 100;

    // Find tasks that took longer than estimated
    const overdueEstimates = tasks.filter(t => 
      t.estimated_hours && t.actual_hours && t.actual_hours > t.estimated_hours * 1.2
    );

    // Status and priority breakdowns
    const statusBreakdown: Record<string, number> = {};
    const priorityBreakdown: Record<string, number> = {};
    
    tasks.forEach(task => {
      statusBreakdown[task.status] = (statusBreakdown[task.status] || 0) + 1;
      priorityBreakdown[task.priority] = (priorityBreakdown[task.priority] || 0) + 1;
    });

    return {
      completion: {
        percentage: tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0,
        completed: completed.length,
        total: tasks.length,
      },
      velocity: {
        tasksPerDay: recentCompletions.length / 7,
        recentCompletions: recentCompletions.length,
      },
      timeTracking: {
        totalEstimated,
        totalActual,
        efficiency: Math.min(efficiency, 999), // Cap at 999%
      },
      statusBreakdown,
      priorityBreakdown,
      blockedTasks: blocked,
      overdueEstimates,
    };
  }, [tasks]);

  const StatusChart = ({ data }: { data: Record<string, number> }) => {
    const total = Object.values(data).reduce((sum, count) => sum + count, 0);
    const colors: Record<string, string> = {
      pending: '#666666',      // gray
      in_progress: '#ff6500',  // orange primary
      blocked: '#0a0a0a',      // black
      testing: '#ff8533',      // orange secondary
      completed: '#ffa366',    // orange tertiary
      failed: '#1a1a1a',       // dark gray
    };

    return (
      <div className="space-y-2">
        {Object.entries(data).map(([status, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={status} className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-[120px]">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors[status] || '#6B7280' }}
                />
                <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                  {status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all" 
                    style={{ 
                      width: `${percentage}%`, 
                      backgroundColor: colors[status] || '#6B7280' 
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[40px]">
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Project Analytics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Completion Rate */}
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-2">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${analytics.completion.percentage * 0.628} 62.8`}
                className="text-green-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {analytics.completion.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {analytics.completion.completed} of {analytics.completion.total} tasks
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">Completion Rate</p>
        </div>

        {/* Velocity */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {analytics.velocity.tasksPerDay.toFixed(1)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            tasks per day
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {analytics.velocity.recentCompletions} completed this week
          </p>
        </div>

        {/* Time Efficiency */}
        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${
            analytics.timeTracking.efficiency > 100 
              ? 'text-orange-600 dark:text-orange-400' 
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {analytics.timeTracking.efficiency.toFixed(0)}%
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            time efficiency
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {analytics.timeTracking.totalEstimated}h est / {analytics.timeTracking.totalActual}h actual
          </p>
        </div>

        {/* Blocked Tasks Alert */}
        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${
            analytics.blockedTasks.length > 0 
              ? 'text-gray-600 dark:text-gray-400' 
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {analytics.blockedTasks.length}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            blocked tasks
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {analytics.blockedTasks.length > 0 ? 'Needs attention' : 'All clear'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Task Status Distribution
          </h4>
          <StatusChart data={analytics.statusBreakdown} />
        </div>

        {/* Priority Breakdown */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Priority Distribution
          </h4>
          <StatusChart data={analytics.priorityBreakdown} />
        </div>
      </div>

      {/* Alerts Section */}
      {(analytics.blockedTasks.length > 0 || analytics.overdueEstimates.length > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Attention Required
          </h4>
          
          {analytics.blockedTasks.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                🚫 Blocked Tasks ({analytics.blockedTasks.length})
              </h5>
              <div className="space-y-1">
                {analytics.blockedTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="text-sm text-gray-600 dark:text-gray-400">
                    • {task.name}
                  </div>
                ))}
                {analytics.blockedTasks.length > 3 && (
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    ... and {analytics.blockedTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}

          {analytics.overdueEstimates.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
                ⏰ Time Overruns ({analytics.overdueEstimates.length})
              </h5>
              <div className="space-y-1">
                {analytics.overdueEstimates.slice(0, 3).map(task => (
                  <div key={task.id} className="text-sm text-gray-600 dark:text-gray-400">
                    • {task.name} ({task.actual_hours}h vs {task.estimated_hours}h est)
                  </div>
                ))}
                {analytics.overdueEstimates.length > 3 && (
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    ... and {analytics.overdueEstimates.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}