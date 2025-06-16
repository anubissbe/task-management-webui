import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import { format } from 'date-fns';

export function BoardSelector() {
  const navigate = useNavigate();
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAllProjects,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Select a Project Board</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Choose a project to view its Kanban board</p>

        {projects?.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <p className="text-gray-900 dark:text-white font-medium mb-1">No projects yet</p>
            <p className="text-gray-500 dark:text-gray-400">Create a project first to access its board</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects?.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-orange-500/30 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-orange-500/20 transition-shadow cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${project.status === 'active' ? 'bg-green-100 text-green-800' : 
                      project.status === 'completed' ? 'bg-orange-100 text-orange-800' :
                      project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                    {project.status}
                  </span>
                </div>
                
                {project.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Created {format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                  <button
                    className="text-orange-600 hover:text-orange-700 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project.id}`);
                    }}
                  >
                    Open Board →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}