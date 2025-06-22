import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { ReportingService } from '../services/reportingService';
import { Calendar, TrendingDown } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface BurndownChartProps {
  projectId: string;
  sprintId?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

interface BurndownData {
  dates: string[];
  idealProgress: number[];
  actualProgress: number[];
  totalPoints: number;
  remainingPoints: number;
  completedPoints: number;
  isOnTrack: boolean;
}

const BurndownChart: React.FC<BurndownChartProps> = ({
  projectId,
  sprintId,
  dateRange
}) => {
  const [burndownData, setBurndownData] = useState<BurndownData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'sprint' | 'custom'>('sprint');

  useEffect(() => {
    loadBurndownData();
  }, [projectId, sprintId, dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBurndownData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await ReportingService.getBurndownData({
        projectId,
        sprintId,
        dateRange: dateRange || (selectedPeriod === 'sprint' ? 'currentSprint' : 'custom')
      });
      
      setBurndownData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load burndown data');
    } finally {
      setLoading(false);
    }
  };

  const chartData: ChartData<'line'> = {
    labels: burndownData?.dates || [],
    datasets: [
      {
        label: 'Ideal Progress',
        data: burndownData?.idealProgress || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderDash: [5, 5],
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 5
      },
      {
        label: 'Actual Progress',
        data: burndownData?.actualProgress || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
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
          text: 'Story Points Remaining'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  const getProgressIndicator = () => {
    if (!burndownData) return null;
    
    const completionPercentage = (burndownData.completedPoints / burndownData.totalPoints) * 100;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {burndownData.totalPoints}
              </p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {burndownData.completedPoints}
              </p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {completionPercentage.toFixed(1)}%
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className={`text-lg font-semibold ${
                burndownData.isOnTrack ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {burndownData.isOnTrack ? 'On Track' : 'Behind Schedule'}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${
              burndownData.isOnTrack 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              <TrendingDown className={`w-5 h-5 ${
                burndownData.isOnTrack 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
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
            onClick={loadBurndownData}
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
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Burndown Chart
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Track progress against ideal completion rate
        </p>
      </div>

      {getProgressIndicator()}

      <div className="h-80">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Ideal Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Actual Progress</span>
          </div>
        </div>
        <button
          onClick={() => setSelectedPeriod(selectedPeriod === 'sprint' ? 'custom' : 'sprint')}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
        >
          Switch to {selectedPeriod === 'sprint' ? 'Custom Period' : 'Sprint View'}
        </button>
      </div>
    </div>
  );
};

export default BurndownChart;