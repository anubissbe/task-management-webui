import React, { useMemo, useRef, useEffect } from 'react';
import { Task } from '../types';
import { format, differenceInDays, addDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import clsx from 'clsx';
import { getStatusColor } from '../utils/brandColors';

interface TimelineViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ tasks, onTaskClick }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate date range for all tasks
  const dateRange = useMemo(() => {
    let minDate = new Date();
    let maxDate = new Date();

    tasks.forEach(task => {
      const taskStart = new Date(task.created_at);
      const taskEnd = task.due_date ? new Date(task.due_date) : addDays(taskStart, task.estimated_hours ? Math.ceil(task.estimated_hours / 8) : 1);

      if (taskStart < minDate) minDate = taskStart;
      if (taskEnd > maxDate) maxDate = taskEnd;
    });

    // Add padding
    minDate = addDays(minDate, -7);
    maxDate = addDays(maxDate, 7);

    return { minDate, maxDate };
  }, [tasks]);

  const totalDays = differenceInDays(dateRange.maxDate, dateRange.minDate);
  const pixelsPerDay = 40;

  const getTaskStatusColor = (status: string) => {
    const colorClasses = getStatusColor(status);
    // Extract just the bg and border classes for timeline bars
    const bgMatch = colorClasses.match(/bg-\S+/);
    const borderMatch = colorClasses.match(/border-\S+/);
    return `${bgMatch ? bgMatch[0] : 'bg-gray-400'} ${borderMatch ? borderMatch[0] : 'border-gray-500'}`;
  };

  const getPriorityHeight = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'h-10';
      case 'high':
        return 'h-9';
      case 'medium':
        return 'h-8';
      case 'low':
        return 'h-7';
      default:
        return 'h-8';
    }
  };

  // Group tasks by assigned user or status
  const taskGroups = useMemo(() => {
    const groups = new Map<string, Task[]>();
    
    tasks.forEach(task => {
      const groupKey = task.assigned_to || 'Unassigned';
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(task);
    });

    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tasks]);

  // Generate day headers
  const dayHeaders = useMemo(() => {
    const headers = [];
    let currentDate = dateRange.minDate;
    
    for (let i = 0; i <= totalDays; i++) {
      headers.push({
        date: currentDate,
        label: format(currentDate, 'd'),
        month: format(currentDate, 'MMM'),
        isWeekStart: currentDate.getDay() === 0,
        isToday: isWithinInterval(new Date(), {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate)
        })
      });
      currentDate = addDays(currentDate, 1);
    }
    
    return headers;
  }, [dateRange, totalDays]);

  // Scroll to today on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const todayIndex = dayHeaders.findIndex(h => h.isToday);
      if (todayIndex >= 0) {
        scrollContainerRef.current.scrollLeft = (todayIndex - 10) * pixelsPerDay;
      }
    }
  }, [dayHeaders]);

  const calculateTaskPosition = (task: Task) => {
    const startDate = new Date(task.created_at);
    const endDate = task.due_date 
      ? new Date(task.due_date) 
      : addDays(startDate, task.estimated_hours ? Math.ceil(task.estimated_hours / 8) : 1);

    const startOffset = differenceInDays(startDate, dateRange.minDate);
    const duration = differenceInDays(endDate, startDate) || 1;

    return {
      left: startOffset * pixelsPerDay,
      width: duration * pixelsPerDay,
      startDate,
      endDate
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Timeline Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Timeline View
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 rounded" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-600 rounded" />
              <span>Blocked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden"
        >
          <div className="min-w-full" style={{ width: `${totalDays * pixelsPerDay}px` }}>
            {/* Date headers */}
            <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="flex h-16">
                {dayHeaders.map((header, index) => (
                  <div
                    key={index}
                    className={clsx(
                      'flex-shrink-0 border-r border-gray-200 dark:border-gray-700',
                      header.isToday && 'bg-orange-50 dark:bg-orange-900/20',
                      header.isWeekStart && 'border-r-2 border-gray-400 dark:border-gray-500'
                    )}
                    style={{ width: `${pixelsPerDay}px` }}
                  >
                    <div className="text-center py-1">
                      <div className={clsx(
                        'text-xs font-medium',
                        header.isToday ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'
                      )}>
                        {header.month}
                      </div>
                      <div className={clsx(
                        'text-sm',
                        header.isToday ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-gray-900 dark:text-white'
                      )}>
                        {header.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task rows grouped by assignee */}
            <div className="relative">
              {taskGroups.map(([groupName, groupTasks]) => (
                <div key={groupName} className="border-b border-gray-200 dark:border-gray-700">
                  {/* Group header */}
                  <div className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{groupName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{groupTasks.length} tasks</div>
                  </div>

                  {/* Task bars */}
                  <div className="relative h-32 bg-white dark:bg-gray-800">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {dayHeaders.map((header, index) => (
                        <div
                          key={index}
                          className={clsx(
                            'flex-shrink-0 border-r border-gray-100 dark:border-gray-700',
                            header.isToday && 'bg-orange-50/50 dark:bg-orange-900/10',
                            header.isWeekStart && 'border-r-gray-300 dark:border-r-gray-600'
                          )}
                          style={{ width: `${pixelsPerDay}px` }}
                        />
                      ))}
                    </div>

                    {/* Task bars */}
                    {groupTasks.map((task, taskIndex) => {
                      const position = calculateTaskPosition(task);
                      return (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick(task)}
                          className={clsx(
                            'absolute rounded cursor-pointer transition-all hover:shadow-lg hover:z-10 border',
                            getTaskStatusColor(task.status),
                            getPriorityHeight(task.priority)
                          )}
                          style={{
                            left: `${position.left}px`,
                            width: `${position.width}px`,
                            top: `${10 + (taskIndex % 3) * 35}px`
                          }}
                          title={`${task.name}\n${format(position.startDate, 'MMM d')} - ${format(position.endDate, 'MMM d')}`}
                        >
                          <div className="px-2 py-1 h-full flex items-center">
                            <span className="text-xs text-white truncate font-medium">
                              {task.name}
                            </span>
                          </div>
                          {/* Progress indicator */}
                          {task.status === 'in_progress' && task.actual_hours && task.estimated_hours && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b">
                              <div 
                                className="h-full bg-white/50 rounded-b"
                                style={{ width: `${Math.min(100, (task.actual_hours / task.estimated_hours) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Today indicator */}
            {dayHeaders.some(h => h.isToday) && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-orange-500 z-30 pointer-events-none"
                style={{
                  left: `${dayHeaders.findIndex(h => h.isToday) * pixelsPerDay + pixelsPerDay / 2}px`
                }}
              >
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-orange-500 rounded-full" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Footer */}
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <span>Showing {tasks.length} tasks</span>
          <span>Scroll horizontally to navigate timeline</span>
        </div>
      </div>
    </div>
  );
};