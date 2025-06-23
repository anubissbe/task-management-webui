import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  ChartTypeRegistry,
  Point,
  BubbleDataPoint
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { ReportWidget as ReportWidgetType } from '../services/reportingService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartDataPoint {
  labels?: string[];
  ideal?: number[];
  actual?: number[];
  sprints?: string[];
  points?: number[];
  values?: number[];
  teams?: string[];
  completionRates?: number[];
  avgTaskTimes?: number[];
}

interface KPIData {
  value: string | number;
  subtitle?: string;
  change?: number;
}

interface TableData {
  headers: string[];
  rows: Array<Array<string | number>>;
}

interface ReportWidgetProps {
  widget: ReportWidgetType;
  data: unknown;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
}

const ReportWidget: React.FC<ReportWidgetProps> = ({
  widget,
  data,
  onEdit,
  onDelete,
  isEditing = false
}) => {

  // Transform data based on widget type
  const getChartData = (): ChartData<'line' | 'bar' | 'pie' | 'doughnut'> => {
    const widgetData = data as ChartDataPoint;
    
    switch (widget.type) {
      case 'burndown':
        return {
          labels: widgetData?.labels || [],
          datasets: [{
            label: 'Ideal Progress',
            data: widgetData?.ideal || [],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderDash: [5, 5]
          }, {
            label: 'Actual Progress',
            data: widgetData?.actual || [],
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
          }]
        };
      
      case 'velocity':
        return {
          labels: widgetData?.sprints || [],
          datasets: [{
            label: 'Story Points',
            data: widgetData?.points || [],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1
          }]
        };
      
      case 'taskDistribution':
        return {
          labels: widgetData?.labels || ['Todo', 'In Progress', 'Done'],
          datasets: [{
            data: widgetData?.values || [],
            backgroundColor: [
              'rgba(239, 68, 68, 0.8)',
              'rgba(251, 191, 36, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(168, 85, 247, 0.8)'
            ]
          }]
        };
      
      case 'teamPerformance':
        return {
          labels: widgetData?.teams || [],
          datasets: [{
            label: 'Completion Rate (%)',
            data: widgetData?.completionRates || [],
            backgroundColor: 'rgba(59, 130, 246, 0.8)'
          }, {
            label: 'Avg Task Time (hours)',
            data: widgetData?.avgTaskTimes || [],
            backgroundColor: 'rgba(34, 197, 94, 0.8)'
          }]
        };
      
      default:
        return { labels: [], datasets: [] };
    }
  };

  const getChartOptions = (): ChartOptions<'line' | 'bar' | 'pie' | 'doughnut'> => {
    const baseOptions: ChartOptions<'line' | 'bar' | 'pie' | 'doughnut'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        title: {
          display: false
        }
      }
    };

    switch (widget.type) {
      case 'burndown':
        return {
          ...baseOptions,
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
                text: 'Days'
              }
            }
          }
        };
      
      case 'velocity':
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Story Points'
              }
            }
          }
        };
      
      case 'teamPerformance':
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        };
      
      default:
        return baseOptions;
    }
  };

  const renderChart = () => {
    const chartData = getChartData();
    const chartOptions = getChartOptions();

    switch (widget.type) {
      case 'burndown':
      case 'velocity':
        return <Line data={chartData as ChartData<'line'>} options={chartOptions as ChartOptions<'line'>} />;
      
      case 'teamPerformance':
        return <Bar data={chartData as ChartData<'bar'>} options={chartOptions as ChartOptions<'bar'>} />;
      
      case 'taskDistribution':
        return widget.config?.chartStyle === 'doughnut' 
          ? <Doughnut data={chartData as ChartData<'doughnut'>} options={chartOptions as ChartOptions<'doughnut'>} />
          : <Pie data={chartData as ChartData<'pie'>} options={chartOptions as ChartOptions<'pie'>} />;
      
      case 'kpi':
        return renderKPI();
      
      case 'table':
        return renderTable();
      
      default:
        return <div className="text-gray-500">Unsupported widget type</div>;
    }
  };

  const renderKPI = () => {
    const kpiData = data as KPIData;
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-4xl font-bold text-gray-900 dark:text-white">
          {kpiData?.value || '0'}
        </div>
        {kpiData?.subtitle && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {kpiData.subtitle}
          </div>
        )}
        {kpiData?.change !== undefined && (
          <div className={`text-sm mt-2 ${kpiData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {kpiData.change >= 0 ? '↑' : '↓'} {Math.abs(kpiData.change)}%
          </div>
        )}
      </div>
    );
  };

  const renderTable = () => {
    const tableData = data as TableData;
    if (!tableData?.headers || !tableData?.rows) {
      return <div className="text-gray-500">No data available</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {tableData.headers.map((header: string, index: number) => (
                <th
                  key={index}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full ${
        isEditing ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {widget.title}
        </h3>
        {(onEdit || onDelete) && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="h-64">
        {renderChart()}
      </div>
    </div>
  );
};

export default ReportWidget;