import { useState } from 'react';
import { Task, Project, ActivityEntry } from '../types';

interface ExportReportsProps {
  project: Project;
  tasks: Task[];
  activities?: ActivityEntry[];
  onClose: () => void;
}

interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeSubtasks: boolean;
  includeComments: boolean;
  includeAttachments: boolean;
  includeTimeTracking: boolean;
  dateRange: { start?: string; end?: string };
  statusFilter: string[];
  priorityFilter: string[];
}

export function ExportReports({ project, tasks, activities: _activities = [], onClose }: ExportReportsProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    includeSubtasks: true,
    includeComments: false,
    includeAttachments: false,
    includeTimeTracking: true,
    dateRange: {},
    statusFilter: [],
    priorityFilter: [],
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Filter tasks based on options
      let filteredTasks = tasks;
      
      // Apply status filter
      if (options.statusFilter.length > 0) {
        filteredTasks = filteredTasks.filter(task => options.statusFilter.includes(task.status));
      }
      
      // Apply priority filter
      if (options.priorityFilter.length > 0) {
        filteredTasks = filteredTasks.filter(task => options.priorityFilter.includes(task.priority));
      }
      
      // Apply date range filter
      if (options.dateRange.start || options.dateRange.end) {
        filteredTasks = filteredTasks.filter(task => {
          const taskDate = new Date(task.created_at);
          const start = options.dateRange.start ? new Date(options.dateRange.start) : new Date(0);
          const end = options.dateRange.end ? new Date(options.dateRange.end) : new Date();
          return taskDate >= start && taskDate <= end;
        });
      }
      
      // Filter subtasks if not included
      if (!options.includeSubtasks) {
        filteredTasks = filteredTasks.filter(task => !task.parent_task_id);
      }
      
      switch (options.format) {
        case 'csv':
          await exportToCSV(filteredTasks);
          break;
        case 'json':
          await exportToJSON(filteredTasks);
          break;
        case 'pdf':
          await exportToPDF(filteredTasks);
          break;
      }
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async (tasks: Task[]) => {
    const headers = [
      'ID',
      'Name',
      'Description',
      'Status',
      'Priority',
      'Assigned To',
      'Created Date',
      'Started Date',
      'Completed Date',
      'Estimated Hours',
      'Actual Hours',
      'Parent Task ID',
    ];
    
    if (options.includeTimeTracking) {
      headers.push('Time Efficiency (%)');
    }
    
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => {
        const row = [
          task.id,
          `"${task.name.replace(/"/g, '""')}"`,
          `"${(task.description || '').replace(/"/g, '""')}"`,
          task.status,
          task.priority,
          task.assigned_to || '',
          task.created_at,
          task.started_at || '',
          task.completed_at || '',
          task.estimated_hours || '',
          task.actual_hours || '',
          task.parent_task_id || '',
        ];
        
        if (options.includeTimeTracking) {
          const efficiency = task.estimated_hours && task.actual_hours 
            ? ((task.estimated_hours / task.actual_hours) * 100).toFixed(1)
            : '';
          row.push(efficiency);
        }
        
        return row.join(',');
      })
    ].join('\n');
    
    downloadFile(csvContent, `${project.name}-tasks-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const exportToJSON = async (tasks: Task[]) => {
    const exportData = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
      },
      tasks: tasks.map(task => ({
        ...task,
        comments: options.includeComments ? [] : undefined, // Would be populated from actual data
        attachments: options.includeAttachments ? task.attachments : undefined,
      })),
      exportedAt: new Date().toISOString(),
      exportOptions: options,
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, `${project.name}-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const exportToPDF = async (tasks: Task[]) => {
    // For PDF export, we'll create an HTML representation that can be printed to PDF
    const htmlContent = generatePDFHTML(tasks);
    
    // Create a new window with the HTML content for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Trigger print dialog
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const generatePDFHTML = (tasks: Task[]): string => {
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
    };
    
    const completionRate = taskStats.total > 0 ? ((taskStats.completed / taskStats.total) * 100).toFixed(1) : '0';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${project.name} - Task Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { border-bottom: 2px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #3B82F6; margin: 0; }
        .header .subtitle { color: #6B7280; margin-top: 5px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #F9FAFB; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #1F2937; }
        .stat-label { color: #6B7280; font-size: 14px; margin-top: 5px; }
        .task-list { margin-top: 30px; }
        .task-item { border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
        .task-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .task-title { font-weight: bold; color: #1F2937; margin: 0; }
        .task-meta { font-size: 12px; color: #6B7280; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .status-pending { background: #F3F4F6; color: #374151; }
        .status-in_progress { background: #DBEAFE; color: #1E40AF; }
        .status-completed { background: #D1FAE5; color: #059669; }
        .status-blocked { background: #FEE2E2; color: #DC2626; }
        .priority-critical { color: #DC2626; }
        .priority-high { color: #EA580C; }
        .priority-medium { color: #D97706; }
        .priority-low { color: #059669; }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${project.name} - Task Report</h1>
        <div class="subtitle">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
        <div class="subtitle">Total Tasks: ${tasks.length} | Completion Rate: ${completionRate}%</div>
      </div>
      
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">${taskStats.total}</div>
          <div class="stat-label">Total Tasks</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${taskStats.completed}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${taskStats.inProgress}</div>
          <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${taskStats.blocked}</div>
          <div class="stat-label">Blocked</div>
        </div>
      </div>
      
      <div class="task-list">
        <h2>Task Details</h2>
        ${tasks.map(task => `
          <div class="task-item">
            <div class="task-header">
              <h3 class="task-title">${task.name}</h3>
              <div>
                <span class="status-badge status-${task.status}">${task.status.replace('_', ' ')}</span>
              </div>
            </div>
            <div class="task-meta">
              <strong>Priority:</strong> <span class="priority-${task.priority}">${task.priority}</span> |
              <strong>Created:</strong> ${new Date(task.created_at).toLocaleDateString()} |
              ${task.assigned_to ? `<strong>Assigned to:</strong> ${task.assigned_to} |` : ''}
              ${task.estimated_hours ? `<strong>Estimated:</strong> ${task.estimated_hours}h |` : ''}
              ${task.actual_hours ? `<strong>Actual:</strong> ${task.actual_hours}h |` : ''}
              <strong>ID:</strong> ${task.id}
            </div>
            ${task.description ? `<div style="margin-top: 10px; color: #4B5563;">${task.description}</div>` : ''}
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #6B7280;">
        Report generated by Task Management System
      </div>
    </body>
    </html>`;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                📄 Export & Reports
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Export project data and generate reports
              </p>
            </div>
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

        <div className="p-6 overflow-y-auto">
          {/* Project Overview */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{project.name}</h3>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{taskStats.total}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{taskStats.completed}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{taskStats.inProgress}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">In Progress</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-600 dark:text-gray-300">{taskStats.pending}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600 dark:text-red-400">{taskStats.blocked}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Blocked</div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'csv', label: 'CSV', desc: 'Spreadsheet compatible' },
                  { value: 'json', label: 'JSON', desc: 'Developer friendly' },
                  { value: 'pdf', label: 'PDF', desc: 'Print ready report' },
                ].map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setOptions(prev => ({ ...prev, format: format.value as any }))}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      options.format === format.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium">{format.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{format.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Include Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Include in Export
              </label>
              <div className="space-y-2">
                {[
                  { key: 'includeSubtasks', label: 'Subtasks', desc: 'Include child tasks' },
                  { key: 'includeTimeTracking', label: 'Time Tracking', desc: 'Estimated and actual hours' },
                  { key: 'includeComments', label: 'Comments', desc: 'Task discussions (JSON only)' },
                  { key: 'includeAttachments', label: 'Attachments', desc: 'File attachment info (JSON only)' },
                ].map((option) => (
                  <label key={option.key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={options[option.key as keyof ExportOptions] as boolean}
                      onChange={(e) => setOptions(prev => ({ ...prev, [option.key]: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filters
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date Range</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={options.dateRange.start || ''}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="date"
                      value={options.dateRange.end || ''}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Status (leave empty for all)</label>
                  <select
                    multiple
                    value={options.statusFilter}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      statusFilter: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    size={3}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                    <option value="testing">Testing</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Export will include {tasks.filter(t => {
                if (options.statusFilter.length > 0 && !options.statusFilter.includes(t.status)) return false;
                if (!options.includeSubtasks && t.parent_task_id) return false;
                return true;
              }).length} tasks
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExporting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Exporting...
                  </div>
                ) : (
                  `Export as ${options.format.toUpperCase()}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}