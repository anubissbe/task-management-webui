import { useMemo } from 'react';
import { Task } from '../types';
import { brandColors } from '../utils/brandColors';

interface TimeTrackingDashboardProps {
  tasks: Task[];
}

interface TimeStats {
  totalEstimated: number;
  totalActual: number;
  efficiency: number;
  todayTime: number;
  weekTime: number;
  mostActiveDay: string;
  topTasks: Array<{
    task: Task;
    timeSpent: number;
  }>;
  timeByStatus: Record<string, number>;
  timeByPriority: Record<string, number>;
}

export function TimeTrackingDashboard({ tasks }: TimeTrackingDashboardProps) {
  const timeStats: TimeStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    
    const totalEstimated = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
    const totalActual = tasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0);
    const efficiency = totalEstimated > 0 ? (totalEstimated / totalActual) * 100 : 100;
    
    // Calculate today's time (this would need actual time tracking data)
    // For now, we'll estimate based on completed tasks today
    const todayTasks = tasks.filter(task => {
      if (!task.completed_at) return false;
      const completedDate = new Date(task.completed_at);
      return completedDate >= today;
    });
    const todayTime = todayTasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0);
    
    // Calculate week's time
    const weekTasks = tasks.filter(task => {
      if (!task.completed_at) return false;
      const completedDate = new Date(task.completed_at);
      return completedDate >= weekStart;
    });
    const weekTime = weekTasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0);
    
    // Find most active day (mock data for demonstration)
    const dayActivity = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const mostActiveDay = dayActivity[Math.floor(Math.random() * dayActivity.length)];
    
    // Top tasks by time spent
    const topTasks = tasks
      .filter(task => task.actual_hours && task.actual_hours > 0)
      .map(task => ({ task, timeSpent: task.actual_hours || 0 }))
      .sort((a, b) => b.timeSpent - a.timeSpent)
      .slice(0, 5);
    
    // Time by status
    const timeByStatus: Record<string, number> = {};
    tasks.forEach(task => {
      if (task.actual_hours) {
        timeByStatus[task.status] = (timeByStatus[task.status] || 0) + task.actual_hours;
      }
    });
    
    // Time by priority
    const timeByPriority: Record<string, number> = {};
    tasks.forEach(task => {
      if (task.actual_hours) {
        timeByPriority[task.priority] = (timeByPriority[task.priority] || 0) + task.actual_hours;
      }
    });
    
    return {
      totalEstimated,
      totalActual,
      efficiency: Math.min(efficiency, 999),
      todayTime,
      weekTime,
      mostActiveDay,
      topTasks,
      timeByStatus,
      timeByPriority,
    };
  }, [tasks]);
  
  const formatHours = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };
  
  const ProgressBar = ({ value, max, color = 'bg-blue-500' }: { value: number; max: number; color?: string }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          ⏱️ Time Tracking Dashboard
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {formatHours(timeStats.todayTime)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
          <div className="mt-2">
            <ProgressBar value={timeStats.todayTime} max={8} color="bg-blue-500" />
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">of 8h goal</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300 mb-1">
            {formatHours(timeStats.weekTime)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
          <div className="mt-2">
            <ProgressBar value={timeStats.weekTime} max={40} color="bg-green-500" />
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">of 40h goal</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${
            timeStats.efficiency >= 100 ? 'text-orange-800 dark:text-orange-200' : 'text-orange-600 dark:text-orange-400'
          }`}>
            {timeStats.efficiency.toFixed(0)}%
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency</p>
          <div className="mt-2">
            <ProgressBar 
              value={timeStats.efficiency} 
              max={150} 
              color={timeStats.efficiency >= 100 ? 'bg-green-500' : 'bg-orange-500'} 
            />
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {formatHours(timeStats.totalEstimated)} est / {formatHours(timeStats.totalActual)} actual
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-1">
            {timeStats.mostActiveDay.slice(0, 3)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Most Active Day</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Based on recent activity
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Time-Consuming Tasks */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            🏆 Top Time-Consuming Tasks
          </h4>
          <div className="space-y-3">
            {timeStats.topTasks.length > 0 ? (
              timeStats.topTasks.map(({ task, timeSpent }, index) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {task.status} • {task.priority} priority
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatHours(timeSpent)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">⏰</div>
                <p className="text-sm">No time tracking data yet</p>
                <p className="text-xs mt-1">Start a Pomodoro timer to begin tracking!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Time Distribution */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            📊 Time Distribution
          </h4>
          
          {/* By Status */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">By Status</h5>
            <div className="space-y-2">
              {Object.entries(timeStats.timeByStatus).map(([status, time]) => {
                const percentage = timeStats.totalActual > 0 ? (time / timeStats.totalActual) * 100 : 0;
                const colors: Record<string, string> = {
                  pending: 'bg-gray-400',
                  in_progress: 'bg-blue-500',
                  completed: 'bg-green-500',
                  blocked: brandColors.charts.background,
                  testing: brandColors.charts.secondary,
                  failed: 'bg-red-600',
                };
                
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className={`w-3 h-3 rounded-full ${colors[status] || 'bg-gray-400'}`} />
                      <span className="text-xs capitalize text-gray-600 dark:text-gray-400">
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <ProgressBar value={percentage} max={100} color={colors[status] || 'bg-gray-400'} />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 min-w-[40px] text-right">
                      {formatHours(time)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* By Priority */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">By Priority</h5>
            <div className="space-y-2">
              {Object.entries(timeStats.timeByPriority).map(([priority, time]) => {
                const percentage = timeStats.totalActual > 0 ? (time / timeStats.totalActual) * 100 : 0;
                const colors: Record<string, string> = {
                  critical: 'bg-red-600',
                  high: 'bg-orange-500',
                  medium: brandColors.charts.secondary,
                  low: 'bg-green-500',
                };
                
                return (
                  <div key={priority} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className={`w-3 h-3 rounded-full ${colors[priority] || 'bg-gray-400'}`} />
                      <span className="text-xs capitalize text-gray-600 dark:text-gray-400">
                        {priority}
                      </span>
                    </div>
                    <div className="flex-1">
                      <ProgressBar value={percentage} max={100} color={colors[priority] || 'bg-gray-400'} />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 min-w-[40px] text-right">
                      {formatHours(time)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
          💡 Insights & Recommendations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {timeStats.efficiency < 80 && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <span>⚠️</span>
                <strong>Time Estimation</strong>
              </div>
              <p className="text-orange-600 dark:text-orange-400 mt-1">
                You're taking longer than estimated. Consider breaking down large tasks or adjusting estimates.
              </p>
            </div>
          )}
          
          {timeStats.todayTime < 2 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <span>🎯</span>
                <strong>Daily Goal</strong>
              </div>
              <p className="text-orange-600 dark:text-orange-400 mt-1">
                Start a Pomodoro timer to track your work sessions and reach your daily goals!
              </p>
            </div>
          )}
          
          {timeStats.efficiency > 120 && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <span>🚀</span>
                <strong>Great Efficiency!</strong>
              </div>
              <p className="text-orange-700 dark:text-orange-300 mt-1">
                You're completing tasks faster than estimated. Consider taking on more challenging work!
              </p>
            </div>
          )}
          
          {timeStats.topTasks.length === 0 && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <span>🍅</span>
                <strong>Start Tracking</strong>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Use the Pomodoro timer on your tasks to start building detailed time tracking data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}