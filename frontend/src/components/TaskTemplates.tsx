import { useState } from 'react';
import { Task, TaskPriority } from '../types';
import { taskService } from '../services/taskService';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  tasks: {
    name: string;
    description?: string;
    priority: TaskPriority;
    estimated_hours?: number;
    test_criteria?: string;
    implementation_notes?: string;
  }[];
}

interface TaskTemplatesProps {
  projectId: string;
  onTasksCreated: () => void;
  onClose: () => void;
}

const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'bug-fix',
    name: 'Bug Fix Workflow',
    description: 'Standard workflow for investigating and fixing bugs',
    category: 'Development',
    icon: '🐛',
    color: 'bg-red-100 border-red-200',
    tasks: [
      {
        name: 'Reproduce Bug',
        description: 'Create steps to reliably reproduce the reported bug',
        priority: 'high',
        estimated_hours: 1,
        test_criteria: 'Bug can be consistently reproduced with clear steps',
        implementation_notes: '1. Gather bug report details\n2. Set up test environment\n3. Follow reproduction steps\n4. Document exact conditions'
      },
      {
        name: 'Root Cause Analysis',
        description: 'Investigate and identify the underlying cause of the bug',
        priority: 'high',
        estimated_hours: 2,
        test_criteria: 'Root cause identified and documented',
        implementation_notes: '1. Review relevant code sections\n2. Check recent changes\n3. Use debugging tools\n4. Document findings'
      },
      {
        name: 'Implement Fix',
        description: 'Develop and implement the solution for the bug',
        priority: 'high',
        estimated_hours: 3,
        test_criteria: 'Fix resolves the issue without introducing regressions',
        implementation_notes: '1. Design minimal fix\n2. Implement solution\n3. Add defensive coding\n4. Update related documentation'
      },
      {
        name: 'Test Fix',
        description: 'Thoroughly test the fix and verify no regressions',
        priority: 'medium',
        estimated_hours: 2,
        test_criteria: 'Bug is fixed and no new issues introduced',
        implementation_notes: '1. Test original bug scenario\n2. Run regression tests\n3. Test edge cases\n4. Verify in different environments'
      },
      {
        name: 'Deploy and Monitor',
        description: 'Deploy the fix and monitor for any issues',
        priority: 'medium',
        estimated_hours: 1,
        test_criteria: 'Fix deployed successfully and monitored',
        implementation_notes: '1. Deploy to staging\n2. Deploy to production\n3. Monitor logs\n4. Verify fix in production'
      }
    ]
  },
  {
    id: 'feature-development',
    name: 'Feature Development',
    description: 'Complete workflow for developing new features',
    category: 'Development',
    icon: '✨',
    color: 'bg-blue-100 border-blue-200',
    tasks: [
      {
        name: 'Requirements Analysis',
        description: 'Analyze and document feature requirements',
        priority: 'high',
        estimated_hours: 2,
        test_criteria: 'Requirements are clear, complete, and approved',
        implementation_notes: '1. Gather stakeholder input\n2. Define acceptance criteria\n3. Identify dependencies\n4. Document edge cases'
      },
      {
        name: 'Technical Design',
        description: 'Design the technical architecture and approach',
        priority: 'high',
        estimated_hours: 3,
        test_criteria: 'Design is reviewed and approved by team',
        implementation_notes: '1. Create technical specification\n2. Design database schema\n3. Plan API endpoints\n4. Consider scalability'
      },
      {
        name: 'UI/UX Design',
        description: 'Design user interface and user experience',
        priority: 'medium',
        estimated_hours: 4,
        test_criteria: 'UI/UX mockups approved by stakeholders',
        implementation_notes: '1. Create wireframes\n2. Design mockups\n3. Plan user flow\n4. Consider accessibility'
      },
      {
        name: 'Backend Implementation',
        description: 'Implement backend logic and API endpoints',
        priority: 'high',
        estimated_hours: 8,
        test_criteria: 'Backend functionality works as designed',
        implementation_notes: '1. Set up database models\n2. Create API endpoints\n3. Implement business logic\n4. Add error handling'
      },
      {
        name: 'Frontend Implementation',
        description: 'Implement user interface and frontend functionality',
        priority: 'high',
        estimated_hours: 6,
        test_criteria: 'Frontend matches design and integrates with backend',
        implementation_notes: '1. Create components\n2. Implement state management\n3. Integrate with API\n4. Add form validation'
      },
      {
        name: 'Testing and QA',
        description: 'Test feature thoroughly and ensure quality',
        priority: 'high',
        estimated_hours: 4,
        test_criteria: 'All tests pass and feature meets requirements',
        implementation_notes: '1. Write unit tests\n2. Write integration tests\n3. Manual testing\n4. Performance testing'
      },
      {
        name: 'Documentation',
        description: 'Create user and technical documentation',
        priority: 'medium',
        estimated_hours: 2,
        test_criteria: 'Documentation is complete and accurate',
        implementation_notes: '1. User guide\n2. API documentation\n3. Technical notes\n4. Update changelog'
      }
    ]
  },
  {
    id: 'research-spike',
    name: 'Research Spike',
    description: 'Investigate new technologies or approaches',
    category: 'Research',
    icon: '🔍',
    color: 'bg-purple-100 border-purple-200',
    tasks: [
      {
        name: 'Define Research Goals',
        description: 'Clearly define what needs to be researched and why',
        priority: 'high',
        estimated_hours: 1,
        test_criteria: 'Research objectives are clear and measurable',
        implementation_notes: '1. Identify key questions\n2. Define success criteria\n3. Set time boundaries\n4. List deliverables'
      },
      {
        name: 'Literature Review',
        description: 'Research existing solutions and documentation',
        priority: 'medium',
        estimated_hours: 4,
        test_criteria: 'Comprehensive understanding of existing solutions',
        implementation_notes: '1. Search documentation\n2. Read articles/papers\n3. Check community discussions\n4. Compare alternatives'
      },
      {
        name: 'Proof of Concept',
        description: 'Create a working prototype to test feasibility',
        priority: 'high',
        estimated_hours: 6,
        test_criteria: 'Prototype demonstrates key concepts',
        implementation_notes: '1. Set up minimal environment\n2. Implement core functionality\n3. Test key scenarios\n4. Document findings'
      },
      {
        name: 'Analysis and Recommendations',
        description: 'Analyze findings and provide recommendations',
        priority: 'high',
        estimated_hours: 2,
        test_criteria: 'Clear recommendations with pros/cons analysis',
        implementation_notes: '1. Summarize findings\n2. List pros and cons\n3. Make recommendations\n4. Estimate implementation effort'
      }
    ]
  },
  {
    id: 'performance-optimization',
    name: 'Performance Optimization',
    description: 'Systematic approach to improving application performance',
    category: 'Optimization',
    icon: '⚡',
    color: 'bg-yellow-100 border-yellow-200',
    tasks: [
      {
        name: 'Performance Baseline',
        description: 'Establish current performance metrics and benchmarks',
        priority: 'high',
        estimated_hours: 2,
        test_criteria: 'Baseline metrics documented and repeatable',
        implementation_notes: '1. Set up monitoring\n2. Run performance tests\n3. Document metrics\n4. Identify bottlenecks'
      },
      {
        name: 'Identify Bottlenecks',
        description: 'Analyze and identify the main performance bottlenecks',
        priority: 'high',
        estimated_hours: 3,
        test_criteria: 'Root causes of performance issues identified',
        implementation_notes: '1. Profile application\n2. Analyze database queries\n3. Check network requests\n4. Review algorithm complexity'
      },
      {
        name: 'Implement Optimizations',
        description: 'Apply performance improvements based on analysis',
        priority: 'high',
        estimated_hours: 6,
        test_criteria: 'Optimizations improve performance metrics',
        implementation_notes: '1. Optimize database queries\n2. Implement caching\n3. Optimize algorithms\n4. Reduce network requests'
      },
      {
        name: 'Measure and Validate',
        description: 'Verify that optimizations improved performance',
        priority: 'medium',
        estimated_hours: 2,
        test_criteria: 'Performance improvements are measurable and significant',
        implementation_notes: '1. Re-run benchmarks\n2. Compare with baseline\n3. Test under load\n4. Document improvements'
      }
    ]
  },
  {
    id: 'security-review',
    name: 'Security Review',
    description: 'Comprehensive security audit and improvement workflow',
    category: 'Security',
    icon: '🔒',
    color: 'bg-green-100 border-green-200',
    tasks: [
      {
        name: 'Security Assessment',
        description: 'Conduct initial security assessment and threat modeling',
        priority: 'high',
        estimated_hours: 4,
        test_criteria: 'Security risks identified and categorized',
        implementation_notes: '1. Review authentication\n2. Check authorization\n3. Analyze data flow\n4. Identify attack vectors'
      },
      {
        name: 'Code Security Audit',
        description: 'Review code for common security vulnerabilities',
        priority: 'high',
        estimated_hours: 6,
        test_criteria: 'Code vulnerabilities identified and documented',
        implementation_notes: '1. Static code analysis\n2. Check for OWASP Top 10\n3. Review dependencies\n4. Validate input handling'
      },
      {
        name: 'Fix Security Issues',
        description: 'Implement fixes for identified security vulnerabilities',
        priority: 'critical',
        estimated_hours: 8,
        test_criteria: 'Security vulnerabilities resolved',
        implementation_notes: '1. Prioritize by severity\n2. Implement fixes\n3. Update dependencies\n4. Improve input validation'
      },
      {
        name: 'Security Testing',
        description: 'Test security improvements and run penetration tests',
        priority: 'high',
        estimated_hours: 4,
        test_criteria: 'Security tests pass and vulnerabilities are resolved',
        implementation_notes: '1. Run automated security tests\n2. Manual penetration testing\n3. Verify fixes\n4. Document security posture'
      }
    ]
  }
];

export function TaskTemplates({ projectId, onTasksCreated, onClose }: TaskTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(TASK_TEMPLATES.map(t => t.category)))];
  
  const filteredTemplates = TASK_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const createTasksFromTemplate = async (template: TaskTemplate) => {
    setIsCreating(true);
    try {
      const createdTasks: Task[] = [];
      
      // Create tasks sequentially to maintain order
      for (let i = 0; i < template.tasks.length; i++) {
        const taskTemplate = template.tasks[i];
        const task = await taskService.createTask({
          project_id: projectId,
          name: taskTemplate.name,
          description: taskTemplate.description,
          priority: taskTemplate.priority,
          estimated_hours: taskTemplate.estimated_hours,
          test_criteria: taskTemplate.test_criteria,
        });
        
        // Update with implementation notes if present
        if (taskTemplate.implementation_notes) {
          await taskService.updateTask(task.id, {
            implementation_notes: taskTemplate.implementation_notes,
          });
        }
        
        createdTasks.push(task);
      }
      
      onTasksCreated();
      onClose();
    } catch (error) {
      console.error('Error creating tasks from template:', error);
    } finally {
      setIsCreating(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                📝 Task Templates
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Choose from pre-built workflows or create tasks from templates
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[60vh]">
          {/* Template List */}
          <div className="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : `${template.color} hover:shadow-md`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          {template.category}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {template.tasks.length} tasks
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Template Preview */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {selectedTemplate ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{selectedTemplate.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {selectedTemplate.tasks.map((task, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {index + 1}.
                        </span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {task.name}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 text-xs rounded text-white ${
                              task.priority === 'critical' ? 'bg-red-600' :
                              task.priority === 'high' ? 'bg-orange-500' :
                              task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}>
                              {task.priority}
                            </span>
                            {task.estimated_hours && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ~{task.estimated_hours}h
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => createTasksFromTemplate(selectedTemplate)}
                  disabled={isCreating}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Creating Tasks...
                    </div>
                  ) : (
                    `Create ${selectedTemplate.tasks.length} Tasks`
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a Template
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Choose a template from the left to preview its tasks and create them in your project.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}