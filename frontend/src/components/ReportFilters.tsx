import React, { useState, useEffect } from 'react';
import { ReportFilter, DateRange } from '../services/reportingService';
import { projectService } from '../services/projectService';
import { memberService } from '../services/memberService';
import { Calendar, Users, FolderOpen, Tag, Clock } from 'lucide-react';

interface ExtendedReportFilter extends Omit<ReportFilter, 'dateRange'> {
  dateRange?: DateRange | 'custom';
  customDateRange?: {
    startDate?: Date;
    endDate?: Date;
  };
  teamMemberIds?: string[];
  taskStatuses?: string[];
  priorities?: string[];
}

interface ReportFiltersProps {
  filters: ExtendedReportFilter;
  onFiltersChange: (filters: ExtendedReportFilter) => void;
  workspaceId: string;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  workspaceId
}) => {
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [members, setMembers] = useState<Array<{ id: string; name: string }>>([]);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadProjects();
    loadMembers();
  }, [workspaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProjects = async () => {
    try {
      const projectList = await projectService.getAllProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadMembers = async () => {
    try {
      const memberList = await memberService.getWorkspaceMembers(workspaceId);
      setMembers(memberList);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const handleDateRangeChange = (range: DateRange | 'custom') => {
    if (range === 'custom') {
      onFiltersChange({
        ...filters,
        dateRange: range,
        customDateRange: {
          startDate: customDateRange.startDate ? new Date(customDateRange.startDate) : undefined,
          endDate: customDateRange.endDate ? new Date(customDateRange.endDate) : undefined
        }
      });
    } else {
      onFiltersChange({
        ...filters,
        dateRange: range,
        customDateRange: undefined
      });
    }
  };

  const handleProjectChange = (projectId: string) => {
    const currentProjects = filters.projectIds || [];
    const newProjects = currentProjects.includes(projectId)
      ? currentProjects.filter(id => id !== projectId)
      : [...currentProjects, projectId];
    
    onFiltersChange({
      ...filters,
      projectIds: newProjects.length > 0 ? newProjects : undefined
    });
  };

  const handleTeamMemberChange = (memberId: string) => {
    const currentMembers = filters.teamMemberIds || [];
    const newMembers = currentMembers.includes(memberId)
      ? currentMembers.filter(id => id !== memberId)
      : [...currentMembers, memberId];
    
    onFiltersChange({
      ...filters,
      teamMemberIds: newMembers.length > 0 ? newMembers : undefined
    });
  };

  const handleStatusChange = (status: string) => {
    const currentStatuses = filters.taskStatuses || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({
      ...filters,
      taskStatuses: newStatuses.length > 0 ? newStatuses : undefined
    });
  };

  const handlePriorityChange = (priority: string) => {
    const currentPriorities = filters.priorities || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];
    
    onFiltersChange({
      ...filters,
      priorities: newPriorities.length > 0 ? newPriorities : undefined
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setCustomDateRange({ startDate: '', endDate: '' });
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div>
        <div className="flex items-center mb-3">
          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(['thisWeek', 'thisMonth', 'thisQuarter', 'thisYear', 'last30Days', 'last90Days'] as DateRange[]).map(range => (
            <button
              key={range}
              onClick={() => handleDateRangeChange(range)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                filters.dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </button>
          ))}
        </div>
        
        {/* Custom Date Range */}
        <div className="mt-3">
          <button
            onClick={() => handleDateRangeChange('custom')}
            className={`w-full px-3 py-2 text-sm rounded-lg transition-colors ${
              filters.dateRange === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Custom Range
          </button>
          {filters.dateRange === 'custom' && (
            <div className="mt-2 space-y-2">
              <input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Projects Filter */}
      <div>
        <div className="flex items-center mb-3">
          <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Projects</h4>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {projects.map(project => (
            <label key={project.id} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.projectIds?.includes(project.id) || false}
                onChange={() => handleProjectChange(project.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{project.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Team Members Filter */}
      <div>
        <div className="flex items-center mb-3">
          <Users className="w-4 h-4 mr-2 text-gray-500" />
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Members</h4>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {members.map(member => (
            <label key={member.id} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.teamMemberIds?.includes(member.id) || false}
                onChange={() => handleTeamMemberChange(member.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{member.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Task Status Filter */}
      <div>
        <div className="flex items-center mb-3">
          <Clock className="w-4 h-4 mr-2 text-gray-500" />
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Task Status</h4>
        </div>
        <div className="space-y-2">
          {['todo', 'in-progress', 'done', 'blocked'].map(status => (
            <label key={status} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.taskStatuses?.includes(status) || false}
                onChange={() => handleStatusChange(status)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div>
        <div className="flex items-center mb-3">
          <Tag className="w-4 h-4 mr-2 text-gray-500" />
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</h4>
        </div>
        <div className="space-y-2">
          {['low', 'medium', 'high', 'critical'].map(priority => (
            <label key={priority} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.priorities?.includes(priority) || false}
                onChange={() => handlePriorityChange(priority)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={clearFilters}
        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default ReportFilters;
export type { ExtendedReportFilter };