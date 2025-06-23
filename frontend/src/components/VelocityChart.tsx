import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { ReportingService } from '../services/reportingService';
import { TrendingUp, Activity, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface VelocityChartProps {
  projectId?: string;
  teamId?: string;
  numberOfSprints?: number;
}

interface VelocityData {
  sprints: string[];
  committed: number[];
  completed: number[];
  averageVelocity: number;
  velocityTrend: 'increasing' | 'decreasing' | 'stable';
  predictedVelocity: number;
  confidenceLevel: number;
}

const VelocityChart: React.FC<VelocityChartProps> = ({
  projectId,
  teamId,
  numberOfSprints = 6
}) => {
  const [velocityData, setVelocityData] = useState<VelocityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'points' | 'percentage'>('points');

  useEffect(() => {
    loadVelocityData();
  }, [projectId, teamId, numberOfSprints]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadVelocityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        ...(projectId && { projectIds: [projectId] }),
        ...(teamId && { teamMemberIds: [teamId] })
      };
      
      const metricsData = await ReportingService.getAdvancedMetrics(filters);
      
      // Process velocity trend data
      const velocityTrend = metricsData.velocityTrend.slice(-numberOfSprints);
      
      const data: VelocityData = {
        sprints: velocityTrend.map(v => v.sprint),
        committed: velocityTrend.map(v => v.committedPoints || 0),
        completed: velocityTrend.map(v => v.storyPoints),
        averageVelocity: velocityTrend.reduce((acc, v) => acc + v.storyPoints, 0) / velocityTrend.length,
        velocityTrend: calculateTrend(velocityTrend.map(v => v.storyPoints)),
        predictedVelocity: calculatePredictedVelocity(velocityTrend.map(v => v.storyPoints)),
        confidenceLevel: calculateConfidenceLevel(velocityTrend.map(v => v.storyPoints))
      };
      
      setVelocityData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load velocity data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (points: number[]): 'increasing' | 'decreasing' | 'stable' => {
    if (points.length < 2) return 'stable';
    
    const firstHalf = points.slice(0, Math.floor(points.length / 2));
    const secondHalf = points.slice(Math.floor(points.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const difference = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (difference > 10) return 'increasing';
    if (difference < -10) return 'decreasing';
    return 'stable';
  };

  const calculatePredictedVelocity = (points: number[]): number => {
    if (points.length < 3) return points[points.length - 1] || 0;
    
    // Simple linear regression
    const n = points.length;
    const indices = Array.from({ length: n }, (_, i) => i);
    
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = points.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((acc, x, i) => acc + x * points[i], 0);
    const sumX2 = indices.reduce((acc, x) => acc + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return Math.max(0, Math.round(slope * n + intercept));
  };

  const calculateConfidenceLevel = (points: number[]): number => {
    if (points.length < 3) return 50;
    
    const mean = points.reduce((a, b) => a + b, 0) / points.length;
    const variance = points.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / points.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / mean) * 100;
    
    // Lower CV means more consistent velocity, higher confidence
    if (coefficientOfVariation < 15) return 90;
    if (coefficientOfVariation < 25) return 75;
    if (coefficientOfVariation < 40) return 60;
    return 40;
  };

  const chartData: ChartData<'bar'> = {
    labels: velocityData?.sprints || [],
    datasets: [
      {
        label: 'Committed',
        data: velocityData?.committed || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      },
      {
        label: 'Completed',
        data: velocityData?.completed || [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (viewMode === 'percentage' && context.datasetIndex === 1) {
              const committed = velocityData?.committed[context.dataIndex] || 1;
              const percentage = ((value / committed) * 100).toFixed(1);
              return `${label}: ${value} points (${percentage}%)`;
            }
            return `${label}: ${value} story points`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Story Points'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Sprint'
        }
      }
    }
  };

  const getTrendIcon = () => {
    if (!velocityData) return null;
    
    switch (velocityData.velocityTrend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'decreasing':
        return <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400 transform rotate-180" />;
      default:
        return <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getMetricsCards = () => {
    if (!velocityData) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Velocity</p>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {velocityData.averageVelocity.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">points per sprint</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Velocity Trend</p>
            {getTrendIcon()}
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {velocityData.velocityTrend}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            over last {numberOfSprints} sprints
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Predicted Next</p>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {velocityData.predictedVelocity}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">story points</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
            <AlertCircle className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {velocityData.confidenceLevel}%
          </p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                velocityData.confidenceLevel >= 75 
                  ? 'bg-green-600' 
                  : velocityData.confidenceLevel >= 50 
                    ? 'bg-yellow-600' 
                    : 'bg-red-600'
              }`}
              style={{ width: `${velocityData.confidenceLevel}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadVelocityData}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Team Velocity
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Sprint velocity trends and predictions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'points' ? 'percentage' : 'points')}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            View: {viewMode === 'points' ? 'Points' : 'Percentage'}
          </button>
          <select
            value={numberOfSprints}
            onChange={(e) => {
              // Update numberOfSprints and reload data instead of page reload
              const newSprintCount = parseInt(e.target.value);
              if (newSprintCount !== numberOfSprints) {
                loadVelocityData();
              }
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={4}>Last 4 Sprints</option>
            <option value={6}>Last 6 Sprints</option>
            <option value={8}>Last 8 Sprints</option>
            <option value={12}>Last 12 Sprints</option>
          </select>
        </div>
      </div>

      {getMetricsCards()}

      <div className="h-80">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Velocity Insights
        </h4>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          {velocityData?.velocityTrend === 'increasing' && (
            <li>• Team velocity is improving over time</li>
          )}
          {velocityData?.velocityTrend === 'decreasing' && (
            <li>• Consider reviewing team capacity or sprint planning</li>
          )}
          {velocityData && velocityData.averageVelocity > 0 && (
            <li>• Based on current trends, plan for ~{velocityData.predictedVelocity} points next sprint</li>
          )}
          {velocityData && velocityData.confidenceLevel < 60 && (
            <li>• Velocity is inconsistent - focus on stabilizing team output</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default VelocityChart;