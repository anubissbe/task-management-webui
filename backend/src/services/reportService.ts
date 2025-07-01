

// Mock database for now - replace with actual db import
const db = {
  query: async (sql: string, params?: any[]) => {
    // Removed log entry for security
    return { rows: [] };
  }
};
import { v4 as uuidv4 } from 'uuid';

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: any[];
  layout: string;
  isPublic: boolean;
  settings: any;
  workspaceId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamPerformance {
  teamId: string;
  teamName: string;
  completionRate: number;
  tasksCompleted: number;
  averageTaskTime: number;
  velocity: number;
}

export interface VelocityTrend {
  sprint: string;
  storyPoints: number;
  committedPoints?: number;
}

export interface RiskFactor {
  factor: string;
  probability: number;
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface AdvancedMetrics {
  performanceMetrics: TeamPerformance[];
  velocityTrend: VelocityTrend[];
  predictiveAnalytics: {
    projectedCompletion: Date;
    confidenceLevel: number;
    riskFactors: RiskFactor[];
  };
}

export class ReportService {
  async getDashboards(workspaceId: string): Promise<Dashboard[]> {
    const query = `
      SELECT * FROM dashboards 
      WHERE workspace_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [workspaceId]);
    return result.rows;
  }

  async getDashboardById(dashboardId: string, workspaceId: string): Promise<Dashboard> {
    const query = `
      SELECT * FROM dashboards 
      WHERE id = $1 AND workspace_id = $2
    `;
    const result = await db.query(query, [dashboardId, workspaceId]);
    if (result.rows.length === 0) {
      throw new Error('Dashboard not found');
    }
    return result.rows[0];
  }

  async createDashboard(data: {
    name: string;
    description?: string;
    widgets: any[];
    layout: string;
    isPublic: boolean;
    settings: any;
    workspaceId: string;
    createdBy: string;
  }): Promise<Dashboard> {
    const id = uuidv4();
    const query = `
      INSERT INTO dashboards (
        id, name, description, widgets, layout, 
        is_public, settings, workspace_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      id,
      data.name,
      data.description,
      JSON.stringify(data.widgets),
      data.layout,
      data.isPublic,
      JSON.stringify(data.settings),
      data.workspaceId,
      data.createdBy
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async updateDashboard(
    dashboardId: string, 
    workspaceId: string, 
    updates: Partial<Dashboard>
  ): Promise<Dashboard> {
    const allowedFields = ['name', 'description', 'widgets', 'layout', 'is_public', 'settings'];
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(key === 'widgets' || key === 'settings' ? JSON.stringify(value) : value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(dashboardId, workspaceId);
    const query = `
      UPDATE dashboards 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount} AND workspace_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Dashboard not found');
    }
    return result.rows[0];
  }

  async deleteDashboard(dashboardId: string, workspaceId: string): Promise<void> {
    const query = `
      DELETE FROM dashboards 
      WHERE id = $1 AND workspace_id = $2
    `;
    await db.query(query, [dashboardId, workspaceId]);
  }

  async getAdvancedMetrics(workspaceId: string, _filters: any): Promise<AdvancedMetrics> {
    // Team Performance Metrics
    const performanceQuery = `
      WITH team_stats AS (
        SELECT 
          u.id as team_id,
          u.name as team_name,
          COUNT(DISTINCT t.id) as tasks_completed,
          AVG(EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 3600) as avg_task_time,
          COUNT(DISTINCT t.id) * 100.0 / NULLIF(COUNT(DISTINCT ta.id), 0) as completion_rate
        FROM users u
        LEFT JOIN task_assignments ta ON ta.user_id = u.id
        LEFT JOIN tasks t ON t.id = ta.task_id AND t.status = 'completed'
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE p.workspace_id = $1
        GROUP BY u.id, u.name
      )
      SELECT 
        team_id,
        team_name,
        COALESCE(completion_rate, 0) as completion_rate,
        tasks_completed,
        ROUND(COALESCE(avg_task_time, 0)::numeric, 1) as average_task_time,
        COALESCE(tasks_completed * 3, 0) as velocity
      FROM team_stats
      ORDER BY completion_rate DESC
    `;
    
    const performanceResult = await db.query(performanceQuery, [workspaceId]);
    const performanceMetrics = performanceResult.rows;

    // Velocity Trend (Mock data for now - in real app, would query sprint data)
    const velocityTrend: VelocityTrend[] = [
      { sprint: 'Sprint 1', storyPoints: 21, committedPoints: 25 },
      { sprint: 'Sprint 2', storyPoints: 24, committedPoints: 24 },
      { sprint: 'Sprint 3', storyPoints: 28, committedPoints: 30 },
      { sprint: 'Sprint 4', storyPoints: 26, committedPoints: 26 },
      { sprint: 'Sprint 5', storyPoints: 30, committedPoints: 32 },
      { sprint: 'Sprint 6', storyPoints: 32, committedPoints: 32 }
    ];

    // Predictive Analytics
    // const avgVelocity = velocityTrend.reduce((acc, v) => acc + v.storyPoints, 0) / velocityTrend.length;
    const velocityGrowth = (velocityTrend[velocityTrend.length - 1].storyPoints - velocityTrend[0].storyPoints) / velocityTrend[0].storyPoints;
    
    const riskFactors: RiskFactor[] = [];
    
    if (velocityGrowth < 0) {
      riskFactors.push({
        factor: 'Declining velocity',
        probability: 0.7,
        impact: 'high',
        mitigation: 'Review team capacity and remove blockers'
      });
    }
    
    const avgCompletionRate = performanceMetrics.reduce((acc: number, team: any) => acc + team.completion_rate, 0) / performanceMetrics.length;
    if (avgCompletionRate < 70) {
      riskFactors.push({
        factor: 'Low completion rate',
        probability: 0.8,
        impact: 'medium',
        mitigation: 'Improve sprint planning and task estimation'
      });
    }

    return {
      performanceMetrics,
      velocityTrend,
      predictiveAnalytics: {
        projectedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        confidenceLevel: 75,
        riskFactors
      }
    };
  }

  async getBurndownData(_params: {
    workspaceId: string;
    projectId: string;
    sprintId?: string;
    dateRange: string;
  }): Promise<any> {
    // Mock burndown data - in real app, would calculate from task data
    const totalPoints = 50;
    const days = 14;
    const dates: string[] = [];
    const idealProgress: number[] = [];
    const actualProgress: number[] = [];
    
    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      dates.push(date.toISOString().split('T')[0]);
      
      // Ideal burndown
      idealProgress.push(totalPoints - (totalPoints / days) * i);
      
      // Actual progress (simulated with some variance)
      const variance = Math.random() * 4 - 2;
      const actual = Math.max(0, totalPoints - (totalPoints / days) * i + variance * i);
      actualProgress.push(Math.round(actual));
    }
    
    const remainingPoints = actualProgress[actualProgress.length - 1];
    const completedPoints = totalPoints - remainingPoints;
    const isOnTrack = remainingPoints <= idealProgress[idealProgress.length - 1];
    
    return {
      dates,
      idealProgress,
      actualProgress,
      totalPoints,
      remainingPoints,
      completedPoints,
      isOnTrack
    };
  }

  async scheduleReport(
    dashboardId: string, 
    workspaceId: string, 
    schedule: any
  ): Promise<void> {
    // In a real app, this would integrate with a job scheduler
    // For now, just validate and store the schedule
    const query = `
      INSERT INTO report_schedules (
        dashboard_id, workspace_id, frequency, recipients, 
        format, day_of_week, day_of_month, hour
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    
    await db.query(query, [
      dashboardId,
      workspaceId,
      schedule.frequency,
      JSON.stringify(schedule.recipients),
      schedule.format,
      schedule.dayOfWeek,
      schedule.dayOfMonth,
      schedule.hour
    ]);
  }
}
