import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import clsx from 'clsx';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    
    tasks.forEach(task => {
      // Use due_date if available, otherwise created_at
      const taskDate = task.due_date || task.created_at;
      const dateKey = format(new Date(taskDate), 'yyyy-MM-dd');
      
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(task);
    });
    
    return grouped;
  }, [tasks]);

  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the starting day of the week (0 = Sunday)
  const startingDayOfWeek = getDay(monthStart);
  
  // Add padding days from previous month
  const paddingDays = Array(startingDayOfWeek).fill(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-200 text-red-900 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Calendar Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Padding days */}
          {paddingDays.map((_, index) => (
            <div key={`padding-${index}`} className="aspect-square" />
          ))}

          {/* Month days */}
          {monthDays.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate.get(dateKey) || [];
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={dateKey}
                className={clsx(
                  'aspect-square border rounded-lg p-2 overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                  isToday
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600'
                )}
              >
                <div className="h-full flex flex-col">
                  <div className={clsx(
                    'text-sm font-medium mb-1',
                    isToday
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white'
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {dayTasks.slice(0, 3).map((task, index) => (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={clsx(
                          'px-1 py-0.5 text-xs rounded cursor-pointer truncate',
                          getStatusColor(task.status)
                        )}
                        title={task.name}
                      >
                        <div className="flex items-center gap-1">
                          <div className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', getPriorityDot(task.priority))} />
                          <span className="truncate">{task.name}</span>
                        </div>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Pending</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/20 rounded" />
                <span className="text-gray-600 dark:text-gray-400">In Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-100 dark:bg-green-900/20 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-100 dark:bg-red-900/20 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Blocked</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {tasks.length} total tasks
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};