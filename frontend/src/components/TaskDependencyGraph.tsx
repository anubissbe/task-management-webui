import { useState, useRef, useMemo } from 'react';
import { Task, TaskDependency } from '../types';

interface TaskDependencyGraphProps {
  tasks: Task[];
  dependencies: TaskDependency[];
  onDependencyAdd: (taskId: string, dependsOnTaskId: string) => void;
  onDependencyRemove: (taskId: string, dependsOnTaskId: string) => void;
  selectedTaskId?: string;
  onTaskSelect: (taskId: string) => void;
}

interface GraphNode {
  id: string;
  task: Task;
  x: number;
  y: number;
  level: number;
  isOnCriticalPath: boolean;
  blockedBy: string[];
  blocks: string[];
}

interface GraphEdge {
  from: string;
  to: string;
  isCritical: boolean;
  isBlocking: boolean;
}

export function TaskDependencyGraph({ 
  tasks, 
  dependencies, 
  onDependencyAdd: _onDependencyAdd, 
  onDependencyRemove: _onDependencyRemove, 
  selectedTaskId, 
  onTaskSelect 
}: TaskDependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  // Drag state for future implementation
  // const [isDragging, setIsDragging] = useState(false);
  // const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 });
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'hierarchical' | 'force' | 'timeline'>('hierarchical');

  // Build dependency map
  const dependencyMap = useMemo(() => {
    const map = new Map<string, { dependsOn: string[], blocks: string[] }>();
    
    tasks.forEach(task => {
      map.set(task.id, { dependsOn: [], blocks: [] });
    });
    
    dependencies.forEach(dep => {
      const dependent = map.get(dep.task_id);
      const dependency = map.get(dep.depends_on_task_id);
      
      if (dependent) {
        dependent.dependsOn.push(dep.depends_on_task_id);
      }
      if (dependency) {
        dependency.blocks.push(dep.task_id);
      }
    });
    
    return map;
  }, [tasks, dependencies]);

  // Calculate critical path
  const criticalPath = useMemo(() => {
    const calculateCriticalPath = (): string[] => {
      const taskDurations = new Map<string, number>();
      const earliestStart = new Map<string, number>();
      const latestStart = new Map<string, number>();
      
      tasks.forEach(task => {
        taskDurations.set(task.id, task.estimated_hours || 1);
        earliestStart.set(task.id, 0);
        latestStart.set(task.id, 0);
      });
      
      // Forward pass - calculate earliest start times
      const visited = new Set<string>();
      const calculateEarliestStart = (taskId: string): number => {
        if (visited.has(taskId)) return earliestStart.get(taskId) || 0;
        visited.add(taskId);
        
        const deps = dependencyMap.get(taskId)?.dependsOn || [];
        let maxEarliest = 0;
        
        deps.forEach(depId => {
          const depEarliest = calculateEarliestStart(depId);
          const depDuration = taskDurations.get(depId) || 1;
          maxEarliest = Math.max(maxEarliest, depEarliest + depDuration);
        });
        
        earliestStart.set(taskId, maxEarliest);
        return maxEarliest;
      };
      
      tasks.forEach(task => calculateEarliestStart(task.id));
      
      // Find project end time
      const projectEndTime = Math.max(...Array.from(earliestStart.values()).map((start, i) => 
        start + (taskDurations.get(tasks[i].id) || 1)
      ));
      
      // Backward pass - calculate latest start times
      const calculateLatestStart = (taskId: string): number => {
        const blocks = dependencyMap.get(taskId)?.blocks || [];
        if (blocks.length === 0) {
          // This is an end task
          const duration = taskDurations.get(taskId) || 1;
          latestStart.set(taskId, projectEndTime - duration);
          return projectEndTime - duration;
        }
        
        let minLatest = Infinity;
        blocks.forEach(blockedId => {
          const blockedLatest = latestStart.get(blockedId) || calculateLatestStart(blockedId);
          minLatest = Math.min(minLatest, blockedLatest);
        });
        
        const duration = taskDurations.get(taskId) || 1;
        latestStart.set(taskId, minLatest - duration);
        return minLatest - duration;
      };
      
      tasks.forEach(task => {
        if (!latestStart.has(task.id)) {
          calculateLatestStart(task.id);
        }
      });
      
      // Find critical path (tasks where earliest start = latest start)
      return tasks
        .filter(task => {
          const earliest = earliestStart.get(task.id) || 0;
          const latest = latestStart.get(task.id) || 0;
          return Math.abs(earliest - latest) < 0.01; // Account for floating point precision
        })
        .map(task => task.id);
    };
    
    return calculateCriticalPath();
  }, [tasks, dependencyMap]);

  // Generate graph layout
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    
    if (layoutMode === 'hierarchical') {
      // Hierarchical layout based on dependency levels
      const levels = new Map<string, number>();
      const visited = new Set<string>();
      
      const calculateLevel = (taskId: string): number => {
        if (visited.has(taskId)) return levels.get(taskId) || 0;
        visited.add(taskId);
        
        const deps = dependencyMap.get(taskId)?.dependsOn || [];
        let maxLevel = 0;
        
        deps.forEach(depId => {
          maxLevel = Math.max(maxLevel, calculateLevel(depId) + 1);
        });
        
        levels.set(taskId, maxLevel);
        return maxLevel;
      };
      
      tasks.forEach(task => calculateLevel(task.id));
      
      // Group tasks by level
      const tasksByLevel = new Map<number, Task[]>();
      tasks.forEach(task => {
        const level = levels.get(task.id) || 0;
        if (!tasksByLevel.has(level)) {
          tasksByLevel.set(level, []);
        }
        tasksByLevel.get(level)!.push(task);
      });
      
      // Position nodes
      const levelWidth = 200;
      const nodeHeight = 80;
      let maxWidth = 0;
      
      tasksByLevel.forEach((levelTasks, level) => {
        levelTasks.forEach((task, index) => {
          const y = index * (nodeHeight + 20) + 50;
          const x = level * levelWidth + 100;
          
          maxWidth = Math.max(maxWidth, x + 150);
          
          nodes.push({
            id: task.id,
            task,
            x,
            y,
            level,
            isOnCriticalPath: criticalPath.includes(task.id),
            blockedBy: dependencyMap.get(task.id)?.dependsOn || [],
            blocks: dependencyMap.get(task.id)?.blocks || [],
          });
        });
      });
      
      setViewBox({ x: 0, y: 0, width: maxWidth + 100, height: Math.max(800, tasksByLevel.size * 100) });
    }
    
    // Create edges
    dependencies.forEach(dep => {
      const fromNode = nodes.find(n => n.id === dep.depends_on_task_id);
      const toNode = nodes.find(n => n.id === dep.task_id);
      
      if (fromNode && toNode) {
        const isCritical = criticalPath.includes(fromNode.id) && criticalPath.includes(toNode.id);
        const isBlocking = toNode.task.status === 'blocked' && fromNode.task.status !== 'completed';
        
        edges.push({
          from: dep.depends_on_task_id,
          to: dep.task_id,
          isCritical,
          isBlocking,
        });
      }
    });
    
    return { nodes, edges };
  }, [tasks, dependencies, dependencyMap, criticalPath, layoutMode]);

  const getTaskStatusColor = (task: Task, isOnCriticalPath: boolean) => {
    const colors = {
      pending: isOnCriticalPath ? '#FEF3C7 border-yellow-500' : '#F3F4F6 border-gray-300',
      in_progress: isOnCriticalPath ? '#DBEAFE border-blue-500' : '#EBF8FF border-blue-300',
      completed: isOnCriticalPath ? '#D1FAE5 border-green-600' : '#F0FDF4 border-green-400',
      blocked: '#FEE2E2 border-red-500',
      testing: isOnCriticalPath ? '#FEF3C7 border-yellow-500' : '#FFFBEB border-yellow-300',
      failed: '#FEE2E2 border-red-600',
    };
    return colors[task.status] || colors.pending;
  };

  const handleTaskClick = (taskId: string) => {
    onTaskSelect(taskId);
  };

  const renderArrowMarker = (isCritical: boolean, isBlocking: boolean) => {
    const markerId = `arrow-${isCritical ? 'critical' : 'normal'}-${isBlocking ? 'blocking' : 'normal'}`;
    const color = isBlocking ? '#EF4444' : isCritical ? '#F59E0B' : '#6B7280';
    
    return (
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={color} />
        </marker>
      </defs>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🔗 Task Dependencies & Flow
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCriticalPath(!showCriticalPath)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                showCriticalPath
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              ⚡ Critical Path
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={layoutMode}
            onChange={(e) => setLayoutMode(e.target.value as any)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="hierarchical">Hierarchical</option>
            <option value="force">Force Layout</option>
            <option value="timeline">Timeline</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-yellow-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Critical Path</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-red-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Blocking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-gray-400"></div>
          <span className="text-gray-600 dark:text-gray-400">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Blocked</span>
        </div>
      </div>

      {/* Graph */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-auto" style={{ height: '600px' }}>
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          className="w-full h-full"
        >
          {/* Render arrow markers */}
          {renderArrowMarker(true, false)}
          {renderArrowMarker(false, false)}
          {renderArrowMarker(true, true)}
          {renderArrowMarker(false, true)}
          
          {/* Render edges */}
          {graphData.edges.map((edge, index) => {
            const fromNode = graphData.nodes.find(n => n.id === edge.from);
            const toNode = graphData.nodes.find(n => n.id === edge.to);
            
            if (!fromNode || !toNode) return null;
            
            const strokeColor = edge.isBlocking ? '#EF4444' : edge.isCritical && showCriticalPath ? '#F59E0B' : '#6B7280';
            const strokeWidth = edge.isCritical && showCriticalPath ? '3' : edge.isBlocking ? '2' : '1';
            const markerId = `arrow-${edge.isCritical && showCriticalPath ? 'critical' : 'normal'}-${edge.isBlocking ? 'blocking' : 'normal'}`;
            
            // Calculate arrow path
            const fromX = fromNode.x + 150; // Node width
            const fromY = fromNode.y + 30; // Node height / 2
            const toX = toNode.x;
            const toY = toNode.y + 30;
            
            // Create curved path for better visualization
            const midX = (fromX + toX) / 2;
            const controlX = midX + (toNode.level - fromNode.level) * 50;
            
            return (
              <g key={`edge-${index}`}>
                <path
                  d={`M ${fromX} ${fromY} Q ${controlX} ${fromY} ${midX} ${(fromY + toY) / 2} Q ${controlX} ${toY} ${toX} ${toY}`}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  fill="none"
                  markerEnd={`url(#${markerId})`}
                  className="transition-all duration-200"
                />
                {edge.isBlocking && (
                  <text
                    x={midX}
                    y={(fromY + toY) / 2 - 10}
                    textAnchor="middle"
                    className="text-xs fill-red-600 font-medium"
                  >
                    BLOCKING
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Render nodes */}
          {graphData.nodes.map((node) => {
            const isSelected = selectedTaskId === node.id;
            const isBlocked = node.task.status === 'blocked';
            const colorClasses = getTaskStatusColor(node.task, node.isOnCriticalPath && showCriticalPath);
            
            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                {/* Node background */}
                <rect
                  width="150"
                  height="60"
                  rx="8"
                  className={`${colorClasses} cursor-pointer transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  } ${isBlocked ? 'animate-pulse' : ''}`}
                  onClick={() => handleTaskClick(node.id)}
                />
                
                {/* Critical path indicator */}
                {node.isOnCriticalPath && showCriticalPath && (
                  <rect
                    width="4"
                    height="60"
                    rx="2"
                    className="fill-yellow-500"
                  />
                )}
                
                {/* Task content */}
                <foreignObject x="8" y="8" width="134" height="44">
                  <div className="text-xs">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {node.task.name}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`px-1 py-0.5 rounded text-xs ${
                        node.task.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        node.task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        node.task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {node.task.priority}
                      </span>
                      {node.task.estimated_hours && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {node.task.estimated_hours}h
                        </span>
                      )}
                    </div>
                  </div>
                </foreignObject>
                
                {/* Dependency indicators */}
                {node.blockedBy.length > 0 && (
                  <circle
                    cx="140"
                    cy="15"
                    r="8"
                    className="fill-red-500"
                  />
                )}
                
                {node.blocks.length > 0 && (
                  <circle
                    cx="140"
                    cy="45"
                    r="8"
                    className="fill-orange-500"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Stats */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-white">{graphData.nodes.length}</div>
          <div className="text-gray-500 dark:text-gray-400">Total Tasks</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-yellow-600">{criticalPath.length}</div>
          <div className="text-gray-500 dark:text-gray-400">Critical Path</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-red-600">
            {graphData.nodes.filter(n => n.task.status === 'blocked').length}
          </div>
          <div className="text-gray-500 dark:text-gray-400">Blocked</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-blue-600">{graphData.edges.length}</div>
          <div className="text-gray-500 dark:text-gray-400">Dependencies</div>
        </div>
      </div>
    </div>
  );
}