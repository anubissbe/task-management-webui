import { useState } from 'react';
import { Task, TaskComment, TaskAttachment, TaskDependency, ActivityEntry, Project } from '../types';
import { TaskComments } from './TaskComments';
import { FileAttachments } from './FileAttachments';
import { ActivityFeed } from './ActivityFeed';
import { PomodoroTimer } from './PomodoroTimer';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDependencyAdd?: (taskId: string, dependsOnTaskId: string) => Promise<void>;
  onDependencyRemove?: (taskId: string, dependsOnTaskId: string) => Promise<void>;
  // Mock data - in real app these would come from API
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  dependencies?: TaskDependency[];
  activities?: ActivityEntry[];
  availableTasks?: Task[];
  currentUser: string;
}

export function TaskDetailModal({ 
  task, 
  onClose, 
  onTaskUpdate,
  onDependencyAdd,
  onDependencyRemove,
  dependencies = [],
  availableTasks = [],
  currentUser 
}: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments' | 'activity' | 'dependencies'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: task.name,
    description: task.description || '',
    priority: task.priority,
    assigned_to: task.assigned_to || '',
    estimated_hours: task.estimated_hours || 0,
    implementation_notes: task.implementation_notes || '',
    test_criteria: task.test_criteria || '',
  });
  const [showTimer, setShowTimer] = useState(false);

  // Mock data for demonstration
  const mockComments: TaskComment[] = [
    {
      id: '1',
      task_id: task.id,
      author: 'john.doe',
      content: 'I\'ve started working on this task. @jane.smith can you review the requirements?',
      created_at: '2025-06-13T10:30:00Z',
      mentions: ['jane.smith'],
    },
    {
      id: '2',
      task_id: task.id,
      author: 'jane.smith',
      content: 'Requirements look good! I\'ll add the test cases.',
      created_at: '2025-06-13T11:15:00Z',
      parent_comment_id: '1',
    },
  ];

  const mockAttachments: TaskAttachment[] = [
    {
      id: '1',
      task_id: task.id,
      filename: 'requirements.pdf',
      file_size: 1024000,
      mime_type: 'application/pdf',
      upload_path: '/uploads/requirements.pdf',
      uploaded_by: currentUser,
      uploaded_at: '2025-06-13T09:00:00Z',
    },
    {
      id: '2',
      task_id: task.id,
      filename: 'mockup.png',
      file_size: 512000,
      mime_type: 'image/png',
      upload_path: '/uploads/mockup.png',
      uploaded_by: 'alice.brown',
      uploaded_at: '2025-06-13T14:30:00Z',
    },
  ];

  const mockActivities: ActivityEntry[] = [
    {
      id: '1',
      project_id: task.project_id,
      task_id: task.id,
      user: currentUser,
      action: 'created',
      details: { task_name: task.name },
      created_at: task.created_at,
    },
    {
      id: '2',
      project_id: task.project_id,
      task_id: task.id,
      user: 'jane.smith',
      action: 'commented',
      details: { comment: 'Added initial feedback' },
      created_at: '2025-06-13T11:15:00Z',
    },
    {
      id: '3',
      project_id: task.project_id,
      task_id: task.id,
      user: currentUser,
      action: 'status_changed',
      details: { from: 'pending', to: task.status },
      created_at: '2025-06-13T12:00:00Z',
    },
  ];

  const handleSave = async () => {
    try {
      await onTaskUpdate(task.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleCommentAdd = async (content: string, parentId?: string) => {
    // Mock implementation - in real app this would call API
    console.log('Adding comment:', { content, parentId, taskId: task.id });
  };

  const handleCommentUpdate = async (commentId: string, content: string) => {
    console.log('Updating comment:', { commentId, content });
  };

  const handleCommentDelete = async (commentId: string) => {
    console.log('Deleting comment:', commentId);
  };

  const handleFileUpload = async (file: File) => {
    // Mock implementation - in real app this would upload to server
    console.log('Uploading file:', file.name);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleFileDelete = async (attachmentId: string) => {
    console.log('Deleting attachment:', attachmentId);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      blocked: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
      testing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: '📝', count: null },
    { id: 'comments', label: 'Comments', icon: '💬', count: mockComments.length },
    { id: 'attachments', label: 'Files', icon: '📎', count: mockAttachments.length },
    { id: 'activity', label: 'Activity', icon: '📈', count: mockActivities.length },
    { id: 'dependencies', label: 'Dependencies', icon: '🔗', count: dependencies.length },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none w-full"
                  autoFocus
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{task.name}</h2>
              )}
              
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority} priority
                </span>
                {task.assigned_to && (
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    👤 {task.assigned_to}
                  </span>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {task.id}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Pomodoro Timer Toggle */}
              <button
                onClick={() => setShowTimer(!showTimer)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  showTimer
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 border border-green-300 dark:border-green-700'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🍅 Timer
              </button>
              
              {/* Edit Toggle */}
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({
                        name: task.name,
                        description: task.description || '',
                        priority: task.priority,
                        assigned_to: task.assigned_to || '',
                        estimated_hours: task.estimated_hours || 0,
                        implementation_notes: task.implementation_notes || '',
                        test_criteria: task.test_criteria || '',
                      });
                    }}
                    className="px-3 py-1 text-sm bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Add a description..."
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {task.description || <span className="text-gray-500 dark:text-gray-400 italic">No description</span>}
                    </div>
                  )}
                </div>

                {/* Task Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.priority}
                        onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    ) : (
                      <div className={`inline-flex px-3 py-2 rounded-lg text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assigned To
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.assigned_to}
                        onChange={(e) => setEditData(prev => ({ ...prev, assigned_to: e.target.value }))}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter username or email"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {task.assigned_to || <span className="text-gray-500 dark:text-gray-400 italic">Unassigned</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Hours
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.estimated_hours}
                        onChange={(e) => setEditData(prev => ({ ...prev, estimated_hours: Number(e.target.value) }))}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.5"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {task.estimated_hours ? `${task.estimated_hours} hours` : <span className="text-gray-500 dark:text-gray-400 italic">Not estimated</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Actual Hours
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {task.actual_hours ? `${task.actual_hours} hours` : <span className="text-gray-500 dark:text-gray-400 italic">No time logged</span>}
                    </div>
                  </div>
                </div>

                {/* Implementation Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Implementation Notes
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.implementation_notes}
                      onChange={(e) => setEditData(prev => ({ ...prev, implementation_notes: e.target.value }))}
                      rows={4}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Add implementation notes..."
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg whitespace-pre-wrap">
                      {task.implementation_notes || <span className="text-gray-500 dark:text-gray-400 italic">No implementation notes</span>}
                    </div>
                  )}
                </div>

                {/* Test Criteria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test Criteria
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.test_criteria}
                      onChange={(e) => setEditData(prev => ({ ...prev, test_criteria: e.target.value }))}
                      rows={3}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Add test criteria..."
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg whitespace-pre-wrap">
                      {task.test_criteria || <span className="text-gray-500 dark:text-gray-400 italic">No test criteria</span>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <TaskComments
                task={task}
                comments={mockComments}
                onCommentAdd={handleCommentAdd}
                onCommentUpdate={handleCommentUpdate}
                onCommentDelete={handleCommentDelete}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'attachments' && (
              <FileAttachments
                taskId={task.id}
                attachments={mockAttachments}
                onFileUpload={handleFileUpload}
                onFileDelete={handleFileDelete}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'activity' && (
              <ActivityFeed
                activities={mockActivities}
                tasks={[task]}
                project={{ id: task.project_id, name: 'Current Project' } as Project}
                currentUser={currentUser}
                showFilters={false}
              />
            )}

            {activeTab === 'dependencies' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  🔗 Task Dependencies
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Dependencies allow you to link tasks that must be completed before this task can start.
                </p>
                
                {/* Add Dependency */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Add Dependency</h5>
                  <select 
                    onChange={(e) => {
                      if (e.target.value && onDependencyAdd) {
                        onDependencyAdd(task.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white">
                    <option value="">Select a task this depends on...</option>
                    {availableTasks.filter(t => t.id !== task.id).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Current Dependencies */}
                {dependencies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-2">🔗</div>
                    <p>No dependencies yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dependencies.map(dep => (
                      <div key={dep.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded border">
                        <span>Depends on: {dep.depends_on_task_id}</span>
                        <button
                          onClick={() => onDependencyRemove?.(task.id, dep.depends_on_task_id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Pomodoro Timer */}
          {showTimer && (
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-4">
              <PomodoroTimer
                task={task}
                onTimeUpdate={(taskId, timeSpent) => {
                  console.log('Time logged:', { taskId, timeSpent });
                }}
                onComplete={() => {
                  console.log('Pomodoro completed for task:', task.id);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}