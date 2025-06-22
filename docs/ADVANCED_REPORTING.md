# 📊 Advanced Reporting and Analytics Documentation

## Overview

The Advanced Reporting and Analytics feature provides comprehensive project insights, team performance metrics, and customizable dashboards with real-time data visualization.

## 🎯 Key Features

### 📈 Interactive Dashboards
- **Drag-and-drop dashboard builder** with customizable layouts
- **6+ widget types** including charts, tables, KPIs, and metrics
- **Real-time data updates** with WebSocket integration
- **Responsive design** optimized for all screen sizes

### 📊 Burndown Charts
- **Sprint progress tracking** with ideal vs actual progress visualization
- **Progress indicators** showing total, completed, and remaining story points
- **Status tracking** with on-track/behind-schedule indicators
- **Interactive tooltips** with detailed progress information

### 📉 Velocity Tracking
- **Team velocity analysis** with historical trend data
- **Predictive analytics** with next sprint velocity predictions
- **Confidence levels** based on velocity consistency
- **Trend analysis** (increasing, decreasing, stable)

### 👥 Team Performance Metrics
- **Comprehensive KPI dashboards** with real-time metrics
- **Multi-view comparisons** (comparison, individual, trends)
- **Radar charts** for team skill/performance visualization
- **Performance scoring** with automated insights

### 🔍 Advanced Filtering
- **Date range filtering** (this week, month, quarter, year, custom)
- **Project-based filtering** with multi-select support
- **Team member filtering** for targeted analysis
- **Status and priority filtering** for focused insights

### 📤 Export Capabilities
- **PDF reports** with professional layouts and charts
- **Excel exports** with raw data and pivot tables
- **CSV exports** for data analysis in external tools
- **Scheduled reports** with automated email delivery

## 🏗️ Technical Architecture

### Frontend Components

#### Core Components
```typescript
// Main dashboard component
AdvancedReportingDashboard.tsx
├── ReportFilters.tsx           // Advanced filtering system
├── DashboardBuilder.tsx        // Drag-and-drop dashboard creation
└── ReportWidget.tsx           // Reusable chart/widget component

// Specialized chart components
BurndownChart.tsx              // Sprint progress tracking
VelocityChart.tsx             // Team velocity analysis
TeamPerformanceDashboard.tsx  // Team metrics and KPIs
```

#### Widget Types
- **Burndown Charts** - Sprint progress visualization
- **Velocity Charts** - Team velocity trends and predictions
- **Task Distribution** - Pie/doughnut charts for status breakdown
- **Team Performance** - Bar charts for team comparisons
- **KPI Cards** - Single metric displays with trend indicators
- **Data Tables** - Tabular data with sorting and filtering

### Backend Services

#### ReportService.ts
```typescript
class ReportService {
  // Dashboard management
  async getDashboards(workspaceId: string): Promise<Dashboard[]>
  async createDashboard(data: DashboardData): Promise<Dashboard>
  async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard>
  
  // Analytics data
  async getAdvancedMetrics(workspaceId: string, filters: ReportFilter): Promise<AdvancedMetrics>
  async getBurndownData(params: BurndownParams): Promise<BurndownData>
  
  // Scheduling
  async scheduleReport(dashboardId: string, schedule: ScheduleConfig): Promise<void>
}
```

#### ExportService.ts
```typescript
class ExportService {
  async exportToPDF(dashboardId: string, options: ExportOptions): Promise<Buffer>
  async exportToExcel(dashboardId: string, options: ExportOptions): Promise<Buffer>
  async exportToCSV(dashboardId: string, options: ExportOptions): Promise<Buffer>
}
```

### Database Schema

#### Core Tables
```sql
-- Dashboard definitions
CREATE TABLE dashboards (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    widgets JSONB NOT NULL DEFAULT '[]',
    layout VARCHAR(50) DEFAULT 'grid',
    is_public BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    workspace_id UUID REFERENCES workspaces(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Report scheduling
CREATE TABLE report_schedules (
    id UUID PRIMARY KEY,
    dashboard_id UUID REFERENCES dashboards(id),
    workspace_id UUID REFERENCES workspaces(id),
    frequency VARCHAR(20) CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    recipients JSONB NOT NULL DEFAULT '[]',
    format VARCHAR(10) CHECK (format IN ('pdf', 'excel')),
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
    hour INTEGER CHECK (hour BETWEEN 0 AND 23),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Usage Guide

### Creating Custom Dashboards

1. **Navigate to Reporting**
   ```
   http://localhost:5173/reporting
   ```

2. **Create New Dashboard**
   - Click "Create Dashboard" button
   - Enter dashboard name and description
   - Choose public/private visibility

3. **Add Widgets**
   - Click "Add Widget" button
   - Select widget type (burndown, velocity, KPI, etc.)
   - Configure widget settings
   - Position and resize as needed

4. **Save Dashboard**
   - Click "Save Dashboard"
   - Dashboard becomes available in sidebar

### Configuring Filters

1. **Open Filters Panel**
   - Click "Filters" button in dashboard header
   - Configure date ranges, projects, teams, status

2. **Apply Filters**
   - Filters apply automatically to all widgets
   - Clear all filters with "Clear All Filters" button

### Exporting Reports

1. **Select Dashboard**
   - Choose dashboard from dropdown
   - Ensure filters are configured

2. **Export Format**
   - Click "Export PDF" for formatted reports
   - Click "Export Excel" for data analysis
   - Click "Export CSV" for raw data

3. **Schedule Reports**
   - Click "Schedule" button
   - Configure frequency and recipients
   - Reports automatically generated and emailed

## 🔧 Configuration

### Environment Variables

```bash
# Report export settings
REPORT_EXPORT_PATH=/tmp/reports
REPORT_RETENTION_DAYS=30

# Email settings for scheduled reports
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-app-password

# Chart rendering
CHART_RENDER_TIMEOUT=30000
CHART_MAX_DATA_POINTS=1000
```

### Feature Flags

```bash
# Enable/disable features
ENABLE_BURNDOWN_CHARTS=true
ENABLE_VELOCITY_TRACKING=true
ENABLE_TEAM_PERFORMANCE=true
ENABLE_EXPORT_PDF=true
ENABLE_EXPORT_EXCEL=true
ENABLE_SCHEDULED_REPORTS=true
```

## 📊 Data Models

### Dashboard Configuration
```typescript
interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: ReportWidget[];
  layout: string;
  isPublic: boolean;
  settings: Record<string, unknown>;
  workspaceId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportWidget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: { x: number; y: number };
  size: { width: number; height: number };
  data?: unknown;
}
```

### Analytics Data
```typescript
interface AdvancedMetrics {
  velocityTrend: VelocityTrend[];
  performanceMetrics: TeamPerformance[];
  predictiveAnalytics: PredictiveAnalytics;
}

interface VelocityTrend {
  sprint: string;
  storyPoints: number;
  committedPoints?: number;
}

interface TeamPerformance {
  teamId: string;
  teamName: string;
  completionRate: number;
  averageTaskTime: number;
  tasksCompleted: number;
  velocity: number;
}
```

### Filter Options
```typescript
interface ReportFilter {
  dateRange?: DateRange;
  projectIds?: string[];
  teamMemberIds?: string[];
  taskStatuses?: string[];
  priorities?: string[];
  customDateRange?: {
    startDate: Date;
    endDate: Date;
  };
}
```

## 🧪 Testing

### E2E Test Coverage

The Advanced Reporting feature includes comprehensive E2E tests covering:

- ✅ Dashboard creation and configuration
- ✅ Widget addition and customization
- ✅ Chart rendering and interaction
- ✅ Filter functionality
- ✅ Export capabilities (PDF, Excel, CSV)
- ✅ Mobile responsiveness
- ✅ Error handling and loading states
- ✅ Performance and accessibility

### Running Tests

```bash
# Run E2E tests for reporting
npm run test:e2e -- --grep "Advanced Reporting"

# Run specific test suites
npm run test:e2e tests/e2e/advanced-reporting.test.ts

# Run with coverage
npm run test:e2e:coverage
```

### Performance Testing

```bash
# Test chart rendering performance
npm run test:performance -- --component=BurndownChart

# Test large dataset handling
npm run test:load -- --endpoint=/api/reports/advanced-metrics
```

## 🔍 Troubleshooting

### Common Issues

1. **Charts Not Rendering**
   ```typescript
   // Check Chart.js registration
   import { Chart as ChartJS, registerables } from 'chart.js';
   ChartJS.register(...registerables);
   ```

2. **Export Failures**
   ```bash
   # Check file permissions
   chmod 755 /tmp/reports
   
   # Check disk space
   df -h /tmp
   ```

3. **Performance Issues**
   ```typescript
   // Optimize data queries
   const metrics = await getAdvancedMetrics({
     limit: 1000,
     cache: true,
     timeRange: 'last30days'
   });
   ```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| RPT001 | Dashboard not found | Check dashboard ID and permissions |
| RPT002 | Export timeout | Reduce data range or chart complexity |
| RPT003 | Invalid filter | Validate filter parameters |
| RPT004 | Insufficient permissions | Check user role and workspace access |

## 🚀 Best Practices

### Dashboard Design
- **Limit widgets per dashboard** to 6-8 for optimal performance
- **Use consistent color schemes** for brand alignment
- **Group related metrics** in logical sections
- **Provide context** with descriptions and tooltips

### Performance Optimization
- **Cache frequently accessed data** for 5-15 minutes
- **Implement lazy loading** for complex charts
- **Use pagination** for large datasets
- **Optimize database queries** with proper indexing

### Security Considerations
- **Validate all user inputs** before processing
- **Implement proper access controls** for sensitive data
- **Sanitize export file names** to prevent path traversal
- **Use workspace isolation** for multi-tenant deployments

## 📈 Metrics and Monitoring

### Key Performance Indicators
- Dashboard load time: < 2 seconds
- Chart render time: < 1 second
- Export generation: < 30 seconds
- API response time: < 500ms

### Monitoring Endpoints
```bash
# Health check
GET /api/reports/health

# Performance metrics
GET /api/reports/metrics

# Export status
GET /api/reports/exports/status
```

## 🔮 Future Enhancements

### Planned Features (v4.4.0)
- 🔄 Real-time dashboard collaboration
- 🔄 Custom widget builder with code editor
- 🔄 Advanced statistical analysis
- 🔄 Integration with external BI tools

### Roadmap (v5.0+)
- 📱 Mobile app with offline reporting
- 🤖 AI-powered insights and recommendations
- 🌐 Multi-language support for reports
- 🔗 Advanced integrations (Tableau, Power BI)

---

For additional support or feature requests, please visit our [GitHub Issues](https://github.com/anubissbe/ProjectHub-Mcp/issues) page.