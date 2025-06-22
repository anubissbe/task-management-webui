import { api } from './api';

export type DateRange = 'thisWeek' | 'thisMonth' | 'thisQuarter' | 'thisYear' | 'last30Days' | 'last90Days';

export interface TeamPerformance {
  teamId: string;
  teamName: string;
  completionRate: number;
  averageTaskTime: number;
  tasksCompleted: number;
  velocity: number;
}

export interface ReportFilter {
  dateRange?: {
    start: string;
    end: string;
  };
  projectIds?: string[];
  teamIds?: string[];
  userIds?: string[];
  status?: string[];
  priority?: string[];
  customFilters?: Record<string, unknown>;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    type?: string;
  }[];
}

export type WidgetType = 'chart' | 'metric' | 'table' | 'list' | 'burndown' | 'velocity' | 'taskDistribution' | 'teamPerformance' | 'kpi';

export interface ReportWidget {
  id: string;
  type: WidgetType;
  title: string;
  subtitle?: string;
  config: {
    chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
    dataSource?: string;
    aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max';
    groupBy?: string;
    filters?: ReportFilter;
    timeGranularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
    metric?: string;
    chartStyle?: string;
  };
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  data?: unknown;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: ReportWidget[];
  layout: string;
  filters?: ReportFilter;
  isPublic: boolean;
  settings: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdvancedMetrics {
  velocityTrend: {
    sprint: string;
    storyPoints: number;
    committedPoints?: number;
  }[];
  performanceMetrics: {
    teamId: string;
    teamName: string;
    completionRate: number;
    averageTaskTime: number;
    tasksCompleted: number;
    velocity: number;
    qualityScore?: number;
    collaborationIndex?: number;
  }[];
  predictiveAnalytics: {
    estimatedCompletion: string;
    riskFactors: { factor: string; impact: 'low' | 'medium' | 'high'; probability: number }[];
    recommendations: string[];
  };
  bottleneckAnalysis: {
    stage: string;
    averageTime: number;
    taskCount: number;
    efficiency: number;
  }[];
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  includeRawData: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  templateId?: string;
}

export class ReportingService {
  // Dashboard management
  static async getDashboards(): Promise<Dashboard[]> {
    const response = await api.get('/reports/dashboards');
    return response.data;
  }

  static async getDashboard(id: string): Promise<Dashboard> {
    return api.get(`/reports/dashboards/${id}`);
  }

  static async createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Dashboard> {
    const response = await api.post('/reports/dashboards', dashboard);
    return response.data;
  }

  static async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    const response = await api.put(`/reports/dashboards/${id}`, updates);
    return response.data;
  }

  static async deleteDashboard(id: string): Promise<void> {
    await api.delete(`/reports/dashboards/${id}`);
  }

  // Widget data fetching
  static async getWidgetData(widget: ReportWidget, filters?: ReportFilter): Promise<ChartData> {
    const requestData = {
      ...widget.config,
      filters: { ...widget.config.filters, ...filters }
    };

    return api.get('/reports/widget-data', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  // Predefined reports
  static async getProjectSummary(projectId: string, dateRange?: { start: string; end: string }): Promise<{ tasks: number; completed: number; inProgress: number; overdue: number }> {
    const params = new URLSearchParams({
      projectId,
      ...(dateRange && { start: dateRange.start, end: dateRange.end })
    });

    return api.get(`/reports/project-summary?${params}`);
  }

  static async getTeamPerformance(teamId?: string, dateRange?: { start: string; end: string }): Promise<{ productivity: number; efficiency: number; members: Array<{ id: string; name: string; tasksCompleted: number }> }> {
    const params = new URLSearchParams({
      ...(teamId && { teamId }),
      ...(dateRange && { start: dateRange.start, end: dateRange.end })
    });

    return api.get(`/reports/team-performance?${params}`);
  }

  static async getTimeTracking(filters?: ReportFilter): Promise<{ totalHours: number; billableHours: number; breakdown: Array<{ date: string; hours: number }> }> {
    return api.get('/reports/time-tracking', {
      method: 'POST',
      body: JSON.stringify({ filters })
    });
  }

  static async getTaskAnalytics(filters?: ReportFilter): Promise<ChartData> {
    return api.get('/reports/task-analytics', {
      method: 'POST',
      body: JSON.stringify({ filters })
    });
  }

  // Advanced analytics
  static async getAdvancedMetrics(filters?: ReportFilter): Promise<AdvancedMetrics> {
    return api.get('/reports/advanced-metrics', {
      method: 'POST',
      body: JSON.stringify({ filters })
    });
  }

  static async getBurndownChart(projectId: string, sprintId?: string): Promise<ChartData> {
    const params = new URLSearchParams({
      projectId,
      ...(sprintId && { sprintId })
    });

    return api.get(`/reports/burndown?${params}`);
  }

  static async getVelocityChart(teamId?: string, periods = 6): Promise<ChartData> {
    const params = new URLSearchParams({
      periods: periods.toString(),
      ...(teamId && { teamId })
    });

    return api.get(`/reports/velocity?${params}`);
  }

  static async getCumulativeFlow(projectId: string, dateRange?: { start: string; end: string }): Promise<ChartData> {
    const params = new URLSearchParams({
      projectId,
      ...(dateRange && { start: dateRange.start, end: dateRange.end })
    });

    return api.get(`/reports/cumulative-flow?${params}`);
  }

  // Export functionality
  static async exportReport(dashboardId: string, options: ExportOptions): Promise<Blob> {
    const response = await fetch(`/api/reports/export/${dashboardId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  static async scheduleReport(dashboardId: string, schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'excel';
    dayOfWeek?: number; // For weekly (0-6)
    dayOfMonth?: number; // For monthly (1-31)
    hour?: number; // 0-23
  }): Promise<void> {
    return api.post(`/reports/schedule/${dashboardId}`, schedule);
  }

  // Template management
  static async getReportTemplates(): Promise<Array<{ id: string; name: string; description: string; type: string }>> {
    return api.get('/reports/templates');
  }

  static async createReportTemplate(template: {
    name: string;
    description?: string;
    widgets: ReportWidget[];
    category: string;
  }): Promise<{ success: boolean; reportId: string; downloadUrl?: string }> {
    return api.post('/reports/templates', template);
  }

  // Real-time data
  // TODO: Implement realtime updates
  // static async subscribeToRealtimeUpdates(dashboardId: string, callback: (data: unknown) => void): Promise<() => void> {
  //   // Implementation would depend on WebSocket setup
  //   // For now, return a cleanup function
  //   return () => {};
  // }

  // Utility functions
  static generateDateRange(period: 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear'): { start: string; end: string } {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (period) {
      case 'last7days':
        start.setDate(now.getDate() - 7);
        break;
      case 'last30days':
        start.setDate(now.getDate() - 30);
        break;
      case 'thisMonth':
        start.setDate(1);
        break;
      case 'lastMonth':
        start.setMonth(now.getMonth() - 1);
        start.setDate(1);
        end.setDate(0); // Last day of previous month
        break;
      case 'thisQuarter': {
        const quarter = Math.floor(now.getMonth() / 3);
        start.setMonth(quarter * 3);
        start.setDate(1);
        break;
      }
      case 'thisYear':
        start.setMonth(0);
        start.setDate(1);
        break;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

  static getDefaultColors(): string[] {
    return [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
  }

  static formatMetric(value: number, type: 'number' | 'percentage' | 'currency' | 'time'): string {
    switch (type) {
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'time':
        return `${Math.floor(value / 60)}h ${value % 60}m`;
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  }

  static async getBurndownData(params: {
    projectId: string;
    sprintId?: string;
    dateRange?: DateRange | 'currentSprint' | 'custom';
  }): Promise<{
    dates: string[];
    idealProgress: number[];
    actualProgress: number[];
    totalPoints: number;
    remainingPoints: number;
    completedPoints: number;
    isOnTrack: boolean;
  }> {
    const response = await api.get('/reports/burndown', { params });
    return response.data;
  }
}