import React, { useState } from 'react';
import { useProjectStore, useFilteredTasks } from '../store/projectStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type ExportFormat = 'csv' | 'json' | 'pdf' | 'xlsx';

export const ExportTasks: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const { currentProject } = useProjectStore();
  const filteredTasks = useFilteredTasks();

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Description', 'Status', 'Priority', 'Created', 'Updated', 'Estimated Hours', 'Actual Hours'];
    const rows = filteredTasks.map(task => [
      task.id,
      task.name,
      task.description || '',
      task.status,
      task.priority,
      format(new Date(task.created_at), 'yyyy-MM-dd HH:mm'),
      format(new Date(task.updated_at), 'yyyy-MM-dd HH:mm'),
      task.estimated_hours || '',
      task.actual_hours || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject?.name || 'tasks'}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const data = {
      project: currentProject,
      exportDate: new Date().toISOString(),
      taskCount: filteredTasks.length,
      tasks: filteredTasks,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject?.name || 'tasks'}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple HTML to PDF export
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${currentProject?.name || 'Tasks'} - Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; font-weight: bold; }
          .priority-critical { color: #dc2626; }
          .priority-high { color: #ea580c; }
          .priority-medium { color: #ca8a04; }
          .priority-low { color: #2563eb; }
          .status-completed { color: #16a34a; }
          .status-in_progress { color: #2563eb; }
          .status-blocked { color: #dc2626; }
        </style>
      </head>
      <body>
        <h1>${currentProject?.name || 'Tasks'} - Task List</h1>
        <p>Exported on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
        <p>Total tasks: ${filteredTasks.length}</p>
        
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
              <th>Est. Hours</th>
              <th>Actual Hours</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTasks.map(task => {
              // Escape HTML to prevent XSS
              const escapeHtml = (str: string) => {
                const div = document.createElement('div');
                div.textContent = str;
                return div.innerHTML;
              };
              
              return `
              <tr>
                <td>${escapeHtml(task.name)}</td>
                <td class="status-${escapeHtml(task.status)}">${escapeHtml(task.status)}</td>
                <td class="priority-${escapeHtml(task.priority)}">${escapeHtml(task.priority)}</td>
                <td>${format(new Date(task.created_at), 'MMM dd, yyyy')}</td>
                <td>${task.estimated_hours || '-'}</td>
                <td>${task.actual_hours || '-'}</td>
              </tr>
            `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject?.name || 'tasks'}-${format(new Date(), 'yyyy-MM-dd')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    // Simple tab-separated values that Excel can open
    const headers = ['ID', 'Name', 'Description', 'Status', 'Priority', 'Created', 'Updated', 'Estimated Hours', 'Actual Hours'];
    const rows = filteredTasks.map(task => [
      task.id,
      task.name,
      task.description || '',
      task.status,
      task.priority,
      format(new Date(task.created_at), 'yyyy-MM-dd HH:mm'),
      format(new Date(task.updated_at), 'yyyy-MM-dd HH:mm'),
      task.estimated_hours || '',
      task.actual_hours || '',
    ]);

    const tsvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t')),
    ].join('\n');

    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject?.name || 'tasks'}-${format(new Date(), 'yyyy-MM-dd')}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    switch (selectedFormat) {
      case 'csv':
        exportToCSV();
        break;
      case 'json':
        exportToJSON();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'xlsx':
        exportToExcel();
        break;
    }
    toast.success(`Tasks exported as ${selectedFormat.toUpperCase()}`);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Export Tasks
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Export {filteredTasks.length} tasks from "{currentProject?.name}"
            </p>

            <div className="space-y-3 mb-6">
              {(['csv', 'json', 'pdf', 'xlsx'] as ExportFormat[]).map((format) => (
                <label
                  key={format}
                  className={clsx(
                    'flex items-center p-3 border rounded-lg cursor-pointer transition-colors',
                    selectedFormat === format
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={selectedFormat === format}
                    onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {format.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format === 'csv' && 'Spreadsheet compatible format'}
                      {format === 'json' && 'Machine-readable format with full data'}
                      {format === 'pdf' && 'Printable document format'}
                      {format === 'xlsx' && 'Excel-compatible format'}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};