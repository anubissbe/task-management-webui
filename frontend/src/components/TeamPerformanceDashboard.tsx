import React, { useEffect, useState, useMemo } from 'react';
import { Bar, Radar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { ReportingService, TeamPerformance, ReportFilter } from '../services/reportingService';
import { useWorkspace } from '../hooks/useWorkspace';
import { Users, TrendingUp, Clock, CheckCircle, AlertTriangle, Award } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

interface TeamPerformanceDashboardProps {
  filters?: ReportFilter;
}

interface PerformanceMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

const TeamPerformanceDashboard: React.FC<TeamPerformanceDashboardProps> = ({ filters = {} }) => {
  const { workspaceId } = useWorkspace();
  const [performanceData, setPerformanceData] = useState<TeamPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'comparison' | 'individual' | 'trends'>('comparison');

  useEffect(() => {
    loadPerformanceData();
  }, [workspaceId, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const metrics = await ReportingService.getAdvancedMetrics(filters);
      setPerformanceData(metrics.performanceMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const aggregatedMetrics = useMemo(() => {
    if (!performanceData.length) return null;

    const totalTasks = performanceData.reduce((acc, team) => acc + team.tasksCompleted, 0);
    const avgCompletionRate = performanceData.reduce((acc, team) => acc + team.completionRate, 0) / performanceData.length;
    const avgTaskTime = performanceData.reduce((acc, team) => acc + team.averageTaskTime, 0) / performanceData.length;
    const totalVelocity = performanceData.reduce((acc, team) => acc + team.velocity, 0);

    const metrics: PerformanceMetric[] = [
      {
        label: 'Total Tasks Completed',
        value: totalTasks,
        change: 12.5, // In real app, calculate from historical data
        trend: 'up',
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'green'
      },
      {
        label: 'Average Completion Rate',
        value: avgCompletionRate,
        change: -2.3,
        trend: 'down',
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'blue'
      },
      {
        label: 'Average Task Time',
        value: avgTaskTime,
        change: -15.2,
        trend: 'up', // Lower is better
        icon: <Clock className="w-5 h-5" />,
        color: 'purple'
      },
      {
        label: 'Team Velocity',
        value: totalVelocity,
        change: 8.7,
        trend: 'up',
        icon: <Award className="w-5 h-5" />,
        color: 'yellow'
      }
    ];

    return metrics;
  }, [performanceData]);

  const comparisonChartData: ChartData<'bar'> = {
    labels: performanceData.map(team => team.teamName),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: performanceData.map(team => team.completionRate),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      },
      {
        label: 'Velocity',
        data: performanceData.map(team => team.velocity),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    ]
  };

  const radarChartData: ChartData<'radar'> = {
    labels: ['Completion Rate', 'Velocity', 'Task Speed', 'Quality', 'Collaboration'],
    datasets: performanceData.map((team, index) => ({
      label: team.teamName,
      data: [
        team.completionRate,
        (team.velocity / 50) * 100, // Normalize to 100
        Math.max(0, 100 - team.averageTaskTime), // Inverse - lower time is better
        85 + Math.random() * 15, // Placeholder for quality metric
        75 + Math.random() * 25  // Placeholder for collaboration metric
      ],
      backgroundColor: `rgba(${index * 60}, ${130 + index * 30}, ${246 - index * 40}, 0.2)`,
      borderColor: `rgb(${index * 60}, ${130 + index * 30}, ${246 - index * 40})`,
      borderWidth: 2,
      pointBackgroundColor: `rgb(${index * 60}, ${130 + index * 30}, ${246 - index * 40})`,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: `rgb(${index * 60}, ${130 + index * 30}, ${246 - index * 40})`
    }))
  };

  const trendChartData: ChartData<'line'> = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: performanceData.map((team, index) => ({
      label: team.teamName,
      data: Array.from({ length: 6 }, (_, i) => 
        team.velocity + Math.random() * 10 - 5 + i * 2
      ),
      borderColor: `rgb(${index * 60}, ${130 + index * 30}, ${246 - index * 40})`,
      backgroundColor: `rgba(${index * 60}, ${130 + index * 30}, ${246 - index * 40}, 0.1)`,
      tension: 0.3
    }))
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const radarOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  const renderMetricCard = (metric: PerformanceMetric) => {
    const colorClasses = {
      green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
    };

    return (
      <div key={metric.label} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
            {metric.icon}
          </div>
          <span className={`text-sm font-medium flex items-center ${
            metric.trend === 'up' && metric.change > 0 ? 'text-green-600' : 
            metric.trend === 'down' && metric.change < 0 ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {metric.change > 0 ? '+' : ''}{metric.change}%
            {metric.trend === 'up' ? '↑' : '↓'}
          </span>
        </div>
        <h4 className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</h4>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {metric.label.includes('Rate') ? `${metric.value}%` : metric.value}
        </p>
      </div>
    );
  };

  const renderTeamCards = () => {
    return performanceData.map(team => (
      <div key={team.teamId} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{team.teamName}</h4>
          <Users className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{team.completionRate}%</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{team.tasksCompleted}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Task Time</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{team.averageTaskTime}h</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Velocity</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{team.velocity}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Performance Score</span>
            <div className="flex items-center">
              <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${team.completionRate}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {((team.completionRate + team.velocity) / 2).toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Performance</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and compare team metrics across your workspace
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'comparison' | 'individual' | 'trends')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="comparison">Team Comparison</option>
            <option value="individual">Individual Teams</option>
            <option value="trends">Performance Trends</option>
          </select>
        </div>
      </div>

      {/* Aggregate Metrics */}
      {aggregatedMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {aggregatedMetrics.map(renderMetricCard)}
        </div>
      )}

      {/* Charts Section */}
      {viewMode === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Team Comparison
            </h3>
            <div className="h-80">
              <Bar data={comparisonChartData} options={chartOptions} />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Performance Radar
            </h3>
            <div className="h-80">
              <Radar data={radarChartData} options={radarOptions} />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'individual' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderTeamCards()}
        </div>
      )}

      {viewMode === 'trends' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Velocity Trends
          </h3>
          <div className="h-80">
            <Line data={trendChartData} options={chartOptions as ChartOptions<'line'>} />
          </div>
        </div>
      )}

      {/* Insights Panel */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
          Performance Insights
        </h4>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          {performanceData.length > 0 && (
            <>
              <p>• {performanceData[0].teamName} has the highest completion rate at {performanceData[0].completionRate}%</p>
              <p>• Average task completion time across all teams is {aggregatedMetrics?.[2].value}h</p>
              {aggregatedMetrics?.[1].trend === 'down' && (
                <p>• Overall completion rate has decreased by {Math.abs(aggregatedMetrics[1].change)}% - consider reviewing workload distribution</p>
              )}
              {aggregatedMetrics?.[3].trend === 'up' && (
                <p>• Team velocity is improving, up {aggregatedMetrics[3].change}% from last period</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamPerformanceDashboard;