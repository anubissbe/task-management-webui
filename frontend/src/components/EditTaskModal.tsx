import { useState } from 'react';
import { taskService } from '../services/taskService';
import { Task, TaskPriority, TaskStatus } from '../types';

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
  onTaskUpdated: (task: Task) => void;
}

export function EditTaskModal({ task, onClose, onTaskUpdated }: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    name: task.name,
    description: task.description || '',
    priority: task.priority || 'medium',
    status: task.status,
    estimated_hours: task.estimated_hours?.toString() || '',
    actual_hours: task.actual_hours?.toString() || '',
    test_criteria: task.test_criteria || '',
    implementation_notes: task.implementation_notes || '',
    assigned_to: task.assigned_to || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Task name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updateData: Partial<Task> = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        status: formData.status,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
        actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : undefined,
        test_criteria: formData.test_criteria.trim() || undefined,
        implementation_notes: formData.implementation_notes.trim() || undefined,
        assigned_to: formData.assigned_to.trim() || undefined,
      };

      const updatedTask = await taskService.updateTask(task.id, updateData);
      onTaskUpdated(updatedTask);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await taskService.deleteTask(task.id);
      onClose();
      window.location.reload(); // Simple refresh to update the board
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Task</h2>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
          >
            🗑️ Delete Task
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="testing">Testing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                id="estimated_hours"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="actual_hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Actual Hours
              </label>
              <input
                type="number"
                id="actual_hours"
                value={formData.actual_hours}
                onChange={(e) => setFormData({ ...formData, actual_hours: e.target.value })}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assigned To
              </label>
              <input
                type="text"
                id="assigned_to"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter assignee name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="test_criteria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Test Criteria
            </label>
            <textarea
              id="test_criteria"
              value={formData.test_criteria}
              onChange={(e) => setFormData({ ...formData, test_criteria: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Define how this task should be tested..."
            />
          </div>

          <div>
            <label htmlFor="implementation_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Implementation Notes
            </label>
            <textarea
              id="implementation_notes"
              value={formData.implementation_notes}
              onChange={(e) => setFormData({ ...formData, implementation_notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Add any implementation details or notes..."
            />
          </div>

          {/* Task Metadata */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Information</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div>Created: {new Date(task.created_at).toLocaleString()}</div>
              <div>Updated: {new Date(task.updated_at).toLocaleString()}</div>
              {task.started_at && <div>Started: {new Date(task.started_at).toLocaleString()}</div>}
              {task.completed_at && <div>Completed: {new Date(task.completed_at).toLocaleString()}</div>}
              {(task.subtask_count || 0) > 0 && (
                <div className="col-span-2">
                  Subtasks: {task.completed_subtasks} / {task.subtask_count} completed
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}