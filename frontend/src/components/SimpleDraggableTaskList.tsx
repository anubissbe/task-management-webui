import React from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { Task, TaskStatus } from '../types';

interface DraggableTaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  selectedTasks: string[];
  onToggleSelection: (taskId: string) => void;
}

export const DraggableTaskList: React.FC<DraggableTaskListProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  onDeleteTask,
  selectedTasks,
  onToggleSelection,
}) => {
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in_progress':
        return '→';
      case 'blocked':
        return '✗';
      case 'testing':
        return '🧪';
      case 'failed':
        return '!';
      default:
        return '○';
    }
  };

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {tasks.length === 0 ? (
        <li className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
          No tasks found
        </li>
      ) : (
        tasks.map((task) => (
          <li
            key={task.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="px-6 py-4 flex items-center">
              <input
                type="checkbox"
                checked={selectedTasks.includes(task.id)}
                onChange={() => onToggleSelection(task.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div
                className={clsx(
                  'ml-4 flex-1 cursor-pointer',
                  task.status === 'completed' && 'opacity-60'
                )}
                onClick={() => onTaskClick(task)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(task.status)}</span>
                      <h3
                        className={clsx(
                          'text-sm font-medium text-gray-900 dark:text-white',
                          task.status === 'completed' && 'line-through'
                        )}
                      >
                        {task.name}
                      </h3>
                      <span
                        className={clsx(
                          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                          task.priority === 'critical' &&
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                          task.priority === 'high' &&
                            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                          task.priority === 'medium' &&
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                          task.priority === 'low' &&
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        )}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Created {format(new Date(task.created_at), 'MMM d, yyyy')}
                      {task.estimated_hours && ` • ${task.estimated_hours}h estimated`}
                      {task.actual_hours && ` • ${task.actual_hours}h actual`}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <select
                      value={task.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        onStatusChange(task.id, e.target.value as TaskStatus);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="blocked">Blocked</option>
                      <option value="testing">Testing</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                      }}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))
      )}
    </ul>
  );
};