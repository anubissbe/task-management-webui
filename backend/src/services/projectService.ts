import { pool } from '../config/database';
import { Project, ProjectStats } from '../types';

export class ProjectService {
  async getAllProjects(): Promise<Project[]> {
    const query = `
      SELECT * FROM project_management.projects
      ORDER BY 
        CASE status 
          WHEN 'active' THEN 1
          WHEN 'planning' THEN 2
          WHEN 'paused' THEN 3
          WHEN 'completed' THEN 4
          WHEN 'cancelled' THEN 5
        END,
        created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  async getProjectById(id: string): Promise<Project | null> {
    const query = 'SELECT * FROM project_management.projects WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async createProject(data: {
    name: string;
    description?: string;
    requirements?: string;
    acceptance_criteria?: string;
  }): Promise<Project> {
    const query = `
      INSERT INTO project_management.projects 
      (name, description, requirements, acceptance_criteria, status)
      VALUES ($1, $2, $3, $4, 'planning')
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      data.name,
      data.description,
      data.requirements,
      data.acceptance_criteria
    ]);
    
    return result.rows[0];
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
    // If trying to mark as completed, check if all tasks are done
    if (data.status === 'completed') {
      const taskStats = await pool.query(`
        SELECT COUNT(*) as incomplete_tasks
        FROM project_management.tasks
        WHERE project_id = $1 AND status != 'completed'
      `, [id]);
      
      if (parseInt(taskStats.rows[0].incomplete_tasks) > 0) {
        throw new Error('Cannot mark project as completed while tasks are still open. All tasks must be completed first.');
      }
    }

    const allowedFields = ['name', 'description', 'status', 'requirements', 'acceptance_criteria'];
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (data[field as keyof Project] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(data[field as keyof Project]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return this.getProjectById(id);
    }

    // Add completed_at timestamp if marking as completed
    if (data.status === 'completed') {
      updates.push(`completed_at = $${paramIndex}`);
      values.push(new Date().toISOString());
      paramIndex++;
    }

    values.push(id);
    const query = `
      UPDATE project_management.projects 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteProject(id: string): Promise<boolean> {
    const query = 'DELETE FROM project_management.projects WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async getProjectStats(id: string): Promise<ProjectStats | null> {
    const projectResult = await pool.query(
      'SELECT * FROM project_management.projects WHERE id = $1',
      [id]
    );
    
    if (projectResult.rows.length === 0) {
      return null;
    }

    const taskStats = await pool.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
        COUNT(*) FILTER (WHERE status = 'blocked') as blocked_tasks,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_tasks,
        AVG(CASE WHEN status = 'completed' AND actual_hours IS NOT NULL 
                 THEN actual_hours ELSE NULL END) as avg_actual_hours,
        AVG(estimated_hours) as avg_estimated_hours
      FROM project_management.tasks
      WHERE project_id = $1
    `, [id]);

    const testResults = await pool.query(`
      SELECT 
        COUNT(*) as total_tests,
        COUNT(*) FILTER (WHERE tr.status = 'passed') as passed_tests,
        COUNT(*) FILTER (WHERE tr.status = 'failed') as failed_tests
      FROM project_management.test_results tr
      JOIN project_management.tasks t ON tr.task_id = t.id
      WHERE t.project_id = $1
    `, [id]);

    const stats = taskStats.rows[0];
    const tests = testResults.rows[0];
    const completionRate = stats.total_tasks > 0 
      ? (stats.completed_tasks / stats.total_tasks * 100).toFixed(1)
      : '0';

    return {
      project: projectResult.rows[0],
      statistics: {
        completion_rate: `${completionRate}%`,
        task_breakdown: {
          total: parseInt(stats.total_tasks),
          completed: parseInt(stats.completed_tasks),
          in_progress: parseInt(stats.in_progress_tasks),
          blocked: parseInt(stats.blocked_tasks),
          pending: parseInt(stats.pending_tasks)
        },
        test_results: {
          total: parseInt(tests.total_tests),
          passed: parseInt(tests.passed_tests),
          failed: parseInt(tests.failed_tests),
          pass_rate: tests.total_tests > 0 
            ? `${(tests.passed_tests / tests.total_tests * 100).toFixed(1)}%`
            : 'N/A'
        },
        time_tracking: {
          avg_estimated_hours: parseFloat(stats.avg_estimated_hours) || 0,
          avg_actual_hours: parseFloat(stats.avg_actual_hours) || 0
        }
      }
    };
  }
}