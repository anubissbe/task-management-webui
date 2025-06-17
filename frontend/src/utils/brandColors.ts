// Brand color mappings for ProjectHub-Mcp
// All colors must be variations of black (#0a0a0a) and orange (#ff6500)

export const brandColors = {
  // Status colors
  status: {
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700',
    in_progress: 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
    completed: 'bg-orange-100 text-orange-900 dark:bg-orange-950/50 dark:text-orange-200 border border-orange-300 dark:border-orange-800',
    blocked: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200 dark:border-red-800',
    testing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 border border-orange-300 dark:border-orange-700',
    failed: 'bg-gray-900 text-gray-100 dark:bg-black dark:text-gray-300 border border-gray-700 dark:border-gray-600',
  },
  
  // Priority colors
  priority: {
    critical: 'bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-100 border border-orange-400 dark:border-orange-700',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200 border border-orange-300 dark:border-orange-800',
    medium: 'bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-300 border border-orange-200 dark:border-orange-900',
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-700',
  },
  
  // Activity types
  activity: {
    created: 'text-orange-600 bg-orange-100 dark:text-orange-300 dark:bg-orange-950/30',
    updated: 'text-orange-700 bg-orange-50 dark:text-orange-200 dark:bg-orange-950/20',
    commented: 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900',
    assigned: 'text-orange-800 bg-orange-100 dark:text-orange-100 dark:bg-orange-950/40',
    dependency: 'text-orange-600 bg-orange-50 dark:text-orange-300 dark:bg-orange-950/20',
    completed: 'text-orange-900 bg-orange-200 dark:text-orange-100 dark:bg-orange-900/50',
    started: 'text-orange-700 bg-orange-100 dark:text-orange-200 dark:bg-orange-950/30',
    blocked: 'text-gray-900 bg-gray-200 dark:text-gray-100 dark:bg-gray-800',
  },
  
  // File type colors
  fileType: {
    image: 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300',
    pdf: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    word: 'bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-300',
    excel: 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300',
  },
  
  // Metrics colors
  metrics: {
    primary: 'text-orange-600 dark:text-orange-400',
    secondary: 'text-orange-700 dark:text-orange-300',
    tertiary: 'text-gray-600 dark:text-gray-400',
    success: 'text-orange-800 dark:text-orange-200',
    warning: 'text-orange-600 dark:text-orange-300',
    danger: 'text-gray-900 dark:text-gray-100',
  },
  
  // Chart colors (for Recharts)
  charts: {
    primary: '#ff6500',
    secondary: '#ff8533',
    tertiary: '#ffa366',
    quaternary: '#ffb380',
    background: '#0a0a0a',
    gray: '#666666',
  }
};

// Helper function to get status color
export const getStatusColor = (status: string): string => {
  return brandColors.status[status as keyof typeof brandColors.status] || brandColors.status.pending;
};

// Helper function to get priority color
export const getPriorityColor = (priority: string): string => {
  return brandColors.priority[priority as keyof typeof brandColors.priority] || brandColors.priority.low;
};

// Helper function to get activity color
export const getActivityColor = (type: string): string => {
  return brandColors.activity[type as keyof typeof brandColors.activity] || brandColors.activity.updated;
};

// Helper function to get file type color
export const getFileTypeColor = (type: string): string => {
  const extension = type.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) return brandColors.fileType.image;
  if (extension === 'pdf') return brandColors.fileType.pdf;
  if (['doc', 'docx'].includes(extension)) return brandColors.fileType.word;
  if (['xls', 'xlsx'].includes(extension)) return brandColors.fileType.excel;
  return brandColors.fileType.pdf; // default
};