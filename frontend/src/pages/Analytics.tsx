import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { Project } from '../types';
import { PageBanner } from '../components/PageBanner';

interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  totalEstimatedHours: number;
  completedHours: number;
}

export function Analytics() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<Record<string, ProjectStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const projectsData = await projectService.getAllProjects();
      setProjects(projectsData);

      const statsPromises = projectsData.map(async (project) => {
        const tasks = await taskService.getTasksByProject(project.id);
        
        // Fetch all subtasks
        const subtasksPromises = tasks
          .filter(task => !task.parent_task_id)
          .map(task => taskService.getSubtasks(task.id));
        
        const subtasksArrays = await Promise.all(subtasksPromises);
        const allSubtasks = subtasksArrays.flat();
        const allTasks = [...tasks, ...allSubtasks];

        const stats: ProjectStats = {
          totalTasks: allTasks.length,
          completedTasks: allTasks.filter(t => t.status === 'completed').length,
          inProgressTasks: allTasks.filter(t => t.status === 'in_progress').length,
          pendingTasks: allTasks.filter(t => t.status === 'pending').length,
          blockedTasks: allTasks.filter(t => t.status === 'blocked').length,
          totalEstimatedHours: allTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
          completedHours: allTasks
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
        };

        return { projectId: project.id, stats };
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, ProjectStats> = {};
      statsResults.forEach(({ projectId, stats }) => {
        statsMap[projectId] = stats;
      });
      setProjectStats(statsMap);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageBanner
        icon="📊"
        title="Analytics Dashboard"
        subtitle="Track project progress and team performance"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => {
          const stats = projectStats[project.id] || {
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            pendingTasks: 0,
            blockedTasks: 0,
            totalEstimatedHours: 0,
            completedHours: 0,
          };

          const completionRate = calculatePercentage(stats.completedTasks, stats.totalTasks);
          const hoursProgress = calculatePercentage(stats.completedHours, stats.totalEstimatedHours);

          return (
            <div key={project.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{project.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Task Completion</span>
                    <span className="font-medium">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.completedTasks} of {stats.totalTasks} tasks completed
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Hours Progress</span>
                    <span className="font-medium">{hoursProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${hoursProgress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.completedHours} of {stats.totalEstimatedHours} hours completed
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                  <div className="bg-orange-50 rounded p-3">
                    <div className="text-2xl font-semibold text-orange-900">{stats.inProgressTasks}</div>
                    <div className="text-sm text-orange-600">In Progress</div>
                  </div>
                  <div className="bg-gray-100 rounded p-3">
                    <div className="text-2xl font-semibold text-gray-900">{stats.pendingTasks}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="bg-gray-200 rounded p-3">
                    <div className="text-2xl font-semibold text-gray-900">{stats.blockedTasks}</div>
                    <div className="text-sm text-gray-600">Blocked</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Task Distribution</h4>
                  <div className="space-y-2">
                    {stats.totalTasks > 0 && (
                      <>
                        <TaskBar label="Completed" value={stats.completedTasks} total={stats.totalTasks} color="bg-green-500" />
                        <TaskBar label="In Progress" value={stats.inProgressTasks} total={stats.totalTasks} color="bg-blue-500" />
                        <TaskBar label="Pending" value={stats.pendingTasks} total={stats.totalTasks} color="bg-yellow-500" />
                        <TaskBar label="Blocked" value={stats.blockedTasks} total={stats.totalTasks} color="bg-red-500" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 text-sm text-gray-600">{label}</div>
      <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
        <div
          className={`${color} h-4 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="w-12 text-sm text-gray-700 text-right">{value}</div>
    </div>
  );
}