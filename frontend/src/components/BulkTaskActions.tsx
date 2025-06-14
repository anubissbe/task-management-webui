import { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { taskService } from '../services/taskService';

interface BulkTaskActionsProps {
  selectedTasks: Task[];
  onTasksUpdated: () => void;
  onSelectionCleared: () => void;
}

export function BulkTaskActions({ selectedTasks, onTasksUpdated, onSelectionCleared }: BulkTaskActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (selectedTasks.length === 0) return null;

  const handleBulkStatusUpdate = async (newStatus: TaskStatus) => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedTasks.map(task => taskService.updateTaskStatus(task.id, newStatus))
      );
      onTasksUpdated();
      onSelectionCleared();
    } catch (error) {
      console.error('Error updating task statuses:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkPriorityUpdate = async (newPriority: TaskPriority) => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedTasks.map(task => 
          taskService.updateTask(task.id, { priority: newPriority })
        )
      );
      onTasksUpdated();
      onSelectionCleared();
    } catch (error) {
      console.error('Error updating task priorities:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAssignment = async (assignedTo: string) => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedTasks.map(task => 
          taskService.updateTask(task.id, { assigned_to: assignedTo })
        )
      );
      onTasksUpdated();
      onSelectionCleared();
    } catch (error) {
      console.error('Error assigning tasks:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedTasks.length} tasks? This action cannot be undone.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await Promise.all(
        selectedTasks.map(task => taskService.deleteTask(task.id))
      );
      onTasksUpdated();
      onSelectionCleared();
    } catch (error) {
      console.error('Error deleting tasks:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onSelectionCleared}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

          <div className="flex items-center gap-2">
            {/* Status Update */}
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusUpdate(e.target.value as TaskStatus);
                    e.target.value = '';
                  }
                }}
                disabled={isProcessing}
                className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">Change Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="testing">Testing</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Priority Update */}
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkPriorityUpdate(e.target.value as TaskPriority);
                    e.target.value = '';
                  }
                }}
                disabled={isProcessing}
                className="px-3 py-1.5 text-sm bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg border border-orange-200 dark:border-orange-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">Change Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Assignment */}
            <div className="relative">
              <input
                type="text"
                placeholder="Assign to..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    handleBulkAssignment(e.currentTarget.value.trim());
                    e.currentTarget.value = '';
                  }
                }}
                disabled={isProcessing}
                className="px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 placeholder-green-500 dark:placeholder-green-400 rounded-lg border border-green-200 dark:border-green-700 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 w-32"
              />
            </div>

            {/* More Actions */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isProcessing}
                className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50"
              >
                More
                <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[150px]">
                  <button
                    onClick={() => {
                      const hours = prompt('Enter estimated hours for all selected tasks:');
                      if (hours && !isNaN(Number(hours))) {
                        Promise.all(
                          selectedTasks.map(task => 
                            taskService.updateTask(task.id, { estimated_hours: Number(hours) })
                          )
                        ).then(() => {
                          onTasksUpdated();
                          onSelectionCleared();
                        });
                      }
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Set Est. Hours
                  </button>
                  <button
                    onClick={() => {
                      const notes = prompt('Add implementation notes to all selected tasks:');
                      if (notes) {
                        Promise.all(
                          selectedTasks.map(task => 
                            taskService.updateTask(task.id, { 
                              implementation_notes: (task.implementation_notes || '') + '\n' + notes 
                            })
                          )
                        ).then(() => {
                          onTasksUpdated();
                          onSelectionCleared();
                        });
                      }
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Add Notes
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-600" />
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleBulkDelete();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete Tasks
                  </button>
                </div>
              )}
            </div>
          </div>

          {isProcessing && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Processing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}