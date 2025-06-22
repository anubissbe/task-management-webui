import React, { useState } from 'react';
import { Dashboard, ReportWidget, WidgetType } from '../services/reportingService';
import { Plus, Grid, Save, X } from 'lucide-react';

interface DashboardBuilderProps {
  dashboard?: Dashboard;
  onSave: (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
  onCancel: () => void;
}

const DashboardBuilder: React.FC<DashboardBuilderProps> = ({
  dashboard,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(dashboard?.name || '');
  const [description, setDescription] = useState(dashboard?.description || '');
  const [widgets, setWidgets] = useState<ReportWidget[]>(dashboard?.widgets || []);
  const [isPublic, setIsPublic] = useState(dashboard?.isPublic || false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState<ReportWidget | null>(null);

  const widgetTypes: { type: WidgetType; label: string; description: string }[] = [
    { type: 'burndown', label: 'Burndown Chart', description: 'Track sprint progress over time' },
    { type: 'velocity', label: 'Velocity Chart', description: 'Measure team velocity across sprints' },
    { type: 'taskDistribution', label: 'Task Distribution', description: 'Visualize task status breakdown' },
    { type: 'teamPerformance', label: 'Team Performance', description: 'Compare team metrics' },
    { type: 'kpi', label: 'KPI Card', description: 'Display key performance indicators' },
    { type: 'table', label: 'Data Table', description: 'Show tabular data' }
  ];

  const handleAddWidget = (type: WidgetType) => {
    const newWidget: ReportWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: `New ${type} Widget`,
      position: { x: 0, y: widgets.length },
      size: { width: 4, height: 2 },
      config: {}
    };
    setWidgets([...widgets, newWidget]);
    setShowWidgetModal(false);
    setEditingWidget(newWidget);
  };

  const handleUpdateWidget = (updatedWidget: ReportWidget) => {
    setWidgets(widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w));
    setEditingWidget(null);
  };

  const handleDeleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a dashboard name');
      return;
    }

    onSave({
      name,
      description,
      widgets,
      layout: 'grid',
      isPublic,
      settings: {}
    });
  };

  const renderWidgetEditor = () => {
    if (!editingWidget) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
          <h3 className="text-lg font-medium mb-4">Edit Widget</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Widget Title
              </label>
              <input
                type="text"
                value={editingWidget.title}
                onChange={(e) => setEditingWidget({ ...editingWidget, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {editingWidget.type === 'kpi' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  KPI Metric
                </label>
                <select
                  value={editingWidget.config?.metric || ''}
                  onChange={(e) => setEditingWidget({
                    ...editingWidget,
                    config: { ...editingWidget.config, metric: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a metric</option>
                  <option value="totalTasks">Total Tasks</option>
                  <option value="completedTasks">Completed Tasks</option>
                  <option value="avgCompletionTime">Avg Completion Time</option>
                  <option value="teamVelocity">Team Velocity</option>
                </select>
              </div>
            )}

            {editingWidget.type === 'taskDistribution' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chart Style
                </label>
                <select
                  value={editingWidget.config?.chartStyle || 'pie'}
                  onChange={(e) => setEditingWidget({
                    ...editingWidget,
                    config: { ...editingWidget.config, chartStyle: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="pie">Pie Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Width (columns)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={editingWidget.size.width}
                  onChange={(e) => setEditingWidget({
                    ...editingWidget,
                    size: { ...editingWidget.size, width: parseInt(e.target.value) || 4 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Height (rows)
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={editingWidget.size.height}
                  onChange={(e) => setEditingWidget({
                    ...editingWidget,
                    size: { ...editingWidget.size, height: parseInt(e.target.value) || 2 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setEditingWidget(null)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleUpdateWidget(editingWidget);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Save Widget
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Dashboard Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Dashboard Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dashboard Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter dashboard name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description (optional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Make this dashboard public to all workspace members
            </span>
          </label>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dashboard Widgets</h3>
          <button
            onClick={() => setShowWidgetModal(true)}
            className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </button>
        </div>

        {widgets.length === 0 ? (
          <div className="text-center py-12">
            <Grid className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No widgets added yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Click "Add Widget" to start building your dashboard
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className={`col-span-${widget.size.width} bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-600`}
                style={{ gridColumn: `span ${widget.size.width}` }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{widget.title}</h4>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setEditingWidget(widget)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteWidget(widget.id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {widget.type} • {widget.size.width}x{widget.size.height}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Dashboard
        </button>
      </div>

      {/* Widget Type Modal */}
      {showWidgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select Widget Type</h3>
              <button
                onClick={() => setShowWidgetModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {widgetTypes.map(({ type, label, description }) => (
                <button
                  key={type}
                  onClick={() => handleAddWidget(type)}
                  className="p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-left transition-colors"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">{label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Widget Editor Modal */}
      {renderWidgetEditor()}
    </div>
  );
};

export default DashboardBuilder;