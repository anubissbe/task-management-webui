import React, { useState, useEffect, useCallback } from 'react';
import { ReportingService, Dashboard, ReportFilter, AdvancedMetrics } from '../services/reportingService';
import ReportWidgetComponent from './ReportWidget';
import ReportFilters from './ReportFilters';
import DashboardBuilder from './DashboardBuilder';

const AdvancedReportingDashboard: React.FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [advancedMetrics, setAdvancedMetrics] = useState<AdvancedMetrics | null>(null);
  const [filters, setFilters] = useState<ReportFilter>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | 'create'>('view');
  const [showFilters, setShowFilters] = useState(false);

  const loadDashboards = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardList = await ReportingService.getDashboards();
      setDashboards(dashboardList);
      
      if (dashboardList.length > 0 && !selectedDashboard) {
        setSelectedDashboard(dashboardList[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  }, [selectedDashboard]);

  const loadAdvancedMetrics = useCallback(async () => {
    try {
      const metrics = await ReportingService.getAdvancedMetrics(filters);
      setAdvancedMetrics(metrics);
    } catch (err) {
      console.error('Failed to load advanced metrics:', err);
    }
  }, [filters]);

  // Load dashboards on component mount
  useEffect(() => {
    loadDashboards();
  }, [loadDashboards]);

  // Load advanced metrics when filters change
  useEffect(() => {
    loadAdvancedMetrics();
  }, [loadAdvancedMetrics]);

  const handleCreateDashboard = async (dashboardData: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      const newDashboard = await ReportingService.createDashboard(dashboardData);
      setDashboards([...dashboards, newDashboard]);
      setSelectedDashboard(newDashboard);
      setViewMode('view');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dashboard');
    }
  };

  const handleUpdateDashboard = async (updates: Partial<Dashboard>) => {
    if (!selectedDashboard) return;

    try {
      const updatedDashboard = await ReportingService.updateDashboard(selectedDashboard.id, updates);
      setDashboards(dashboards.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
      setSelectedDashboard(updatedDashboard);
      setViewMode('view');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update dashboard');
    }
  };

  const handleDeleteDashboard = async (dashboardId: string) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) return;

    try {
      await ReportingService.deleteDashboard(dashboardId);
      const updatedDashboards = dashboards.filter(d => d.id !== dashboardId);
      setDashboards(updatedDashboards);
      
      if (selectedDashboard?.id === dashboardId) {
        setSelectedDashboard(updatedDashboards.length > 0 ? updatedDashboards[0] : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dashboard');
    }
  };

  const handleExportDashboard = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!selectedDashboard) return;

    try {
      const blob = await ReportingService.exportReport(selectedDashboard.id, {
        format,
        includeCharts: true,
        includeRawData: format !== 'pdf',
        dateRange: filters.dateRange
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedDashboard.name}-report.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    }
  };

  const renderKPICards = () => {
    if (!advancedMetrics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Velocity</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {advancedMetrics.velocityTrend.length > 0 
                  ? advancedMetrics.velocityTrend[advancedMetrics.velocityTrend.length - 1].storyPoints 
                  : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {advancedMetrics.performanceMetrics.length > 0
                  ? `${(advancedMetrics.performanceMetrics.reduce((acc, team) => acc + team.completionRate, 0) / advancedMetrics.performanceMetrics.length).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Task Time</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {advancedMetrics.performanceMetrics.length > 0
                  ? `${(advancedMetrics.performanceMetrics.reduce((acc, team) => acc + team.averageTaskTime, 0) / advancedMetrics.performanceMetrics.length).toFixed(1)}h`
                  : '0h'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk Level</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {advancedMetrics.predictiveAnalytics.riskFactors.length > 0
                  ? advancedMetrics.predictiveAnalytics.riskFactors[0].impact.toUpperCase()
                  : 'LOW'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced Reporting</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analytics and insights for your projects and teams
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Filters
          </button>
          <button
            onClick={() => setViewMode('create')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Create Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6">
          <ReportFilters
            filters={filters}
            onChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

      {/* KPI Cards */}
      {renderKPICards()}

      {/* Dashboard Selection */}
      {viewMode === 'view' && dashboards.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <select
              value={selectedDashboard?.id || ''}
              onChange={(e) => {
                const dashboard = dashboards.find(d => d.id === e.target.value);
                setSelectedDashboard(dashboard || null);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {dashboards.map(dashboard => (
                <option key={dashboard.id} value={dashboard.id}>
                  {dashboard.name}
                </option>
              ))}
            </select>
            
            {selectedDashboard && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('edit')}
                  className="px-3 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleExportDashboard('pdf')}
                  className="px-3 py-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => handleExportDashboard('excel')}
                  className="px-3 py-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                >
                  Export Excel
                </button>
                <button
                  onClick={() => handleDeleteDashboard(selectedDashboard.id)}
                  className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {viewMode === 'view' && selectedDashboard ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {selectedDashboard.widgets.map((widget) => (
            <ReportWidgetComponent
              key={widget.id}
              widget={widget}
              filters={filters}
            />
          ))}
        </div>
      ) : viewMode === 'create' || viewMode === 'edit' ? (
        <DashboardBuilder
          dashboard={viewMode === 'edit' ? selectedDashboard : undefined}
          onSave={viewMode === 'edit' ? handleUpdateDashboard : handleCreateDashboard}
          onCancel={() => setViewMode('view')}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Dashboards</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create your first dashboard to start analyzing your project data.
          </p>
          <button
            onClick={() => setViewMode('create')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Create Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedReportingDashboard;