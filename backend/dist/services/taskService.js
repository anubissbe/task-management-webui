"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const database_1 = require("../config/database");
class TaskService {
    async getTasksByProject(projectId, status) {
        let query = `
      SELECT t.*, 
             COUNT(DISTINCT st.id) as subtask_count,
             COUNT(DISTINCT st.id) FILTER (WHERE st.status = 'completed') as completed_subtasks
      FROM project_management.tasks t
      LEFT JOIN project_management.tasks st ON st.parent_task_id = t.id
      WHERE t.project_id = $1 AND t.parent_task_id IS NULL
    `;
        const queryParams = [projectId];
        if (status) {
            query += ` AND t.status = $2`;
            queryParams.push(status);
        }
        query += ` GROUP BY t.id ORDER BY t.priority DESC, t.order_index`;
        const result = await database_1.pool.query(query, queryParams);
        return result.rows;
    }
    async getTaskById(id) {
        const query = 'SELECT * FROM project_management.tasks WHERE id = $1';
        const result = await database_1.pool.query(query, [id]);
        return result.rows[0] || null;
    }
    async getSubtasks(parentTaskId) {
        const query = `
      SELECT * FROM project_management.tasks 
      WHERE parent_task_id = $1 
      ORDER BY order_index, priority DESC
    `;
        const result = await database_1.pool.query(query, [parentTaskId]);
        return result.rows;
    }
    async createTask(data) {
        const query = `
      INSERT INTO project_management.tasks 
      (project_id, parent_task_id, name, description, priority, test_criteria, estimated_hours)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const result = await database_1.pool.query(query, [
            data.project_id,
            data.parent_task_id,
            data.name,
            data.description,
            data.priority || 'medium',
            data.test_criteria,
            data.estimated_hours
        ]);
        return result.rows[0];
    }
    async updateTask(id, data) {
        const allowedFields = [
            'name', 'description', 'status', 'priority',
            'order_index', 'estimated_hours', 'actual_hours',
            'implementation_notes', 'test_criteria', 'verification_steps'
        ];
        const updates = [];
        const values = [];
        let paramIndex = 1;
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updates.push(`${field} = $${paramIndex}`);
                values.push(data[field]);
                paramIndex++;
            }
        }
        if (updates.length === 0) {
            return this.getTaskById(id);
        }
        values.push(id);
        const query = `
      UPDATE project_management.tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
        const result = await database_1.pool.query(query, values);
        return result.rows[0] || null;
    }
    async updateTaskStatus(id, status, notes) {
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            // Update task status
            const updateResult = await client.query(`UPDATE project_management.tasks 
         SET status = $2
         WHERE id = $1
         RETURNING *`, [id, status]);
            if (updateResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;
            }
            // Log the status change
            if (notes) {
                await client.query(`INSERT INTO project_management.task_history (task_id, action, new_value, notes)
           VALUES ($1, 'manual_update', $2, $3)`, [id, { status }, notes]);
            }
            await client.query('COMMIT');
            return updateResult.rows[0];
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async deleteTask(id) {
        const query = 'DELETE FROM project_management.tasks WHERE id = $1';
        const result = await database_1.pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }
    async getTaskHistory(taskId) {
        const query = `
      SELECT * FROM project_management.task_history 
      WHERE task_id = $1 
      ORDER BY created_at DESC
    `;
        const result = await database_1.pool.query(query, [taskId]);
        return result.rows;
    }
    async addTestResult(data) {
        const query = `
      INSERT INTO project_management.test_results 
      (task_id, test_name, status, output, error_message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const result = await database_1.pool.query(query, [
            data.task_id,
            data.test_name,
            data.status,
            data.output,
            data.error_message
        ]);
        return result.rows[0];
    }
    async getTestResults(taskId) {
        const query = `
      SELECT * FROM project_management.test_results 
      WHERE task_id = $1 
      ORDER BY created_at DESC
    `;
        const result = await database_1.pool.query(query, [taskId]);
        return result.rows;
    }
    async getNextTask(projectId) {
        let query = `
      WITH task_deps AS (
        SELECT 
          t.id,
          COUNT(td.depends_on_task_id) AS total_deps,
          COUNT(CASE WHEN dep_task.status = 'completed' THEN 1 END) AS completed_deps
        FROM project_management.tasks t
        LEFT JOIN project_management.task_dependencies td ON t.id = td.task_id
        LEFT JOIN project_management.tasks dep_task ON td.depends_on_task_id = dep_task.id
        GROUP BY t.id
      )
      SELECT 
        t.*
      FROM project_management.tasks t
      LEFT JOIN task_deps td ON t.id = td.id
      WHERE t.status = 'pending'
        AND COALESCE(td.total_deps = td.completed_deps, TRUE)
    `;
        const queryParams = [];
        if (projectId) {
            query += ' AND t.project_id = $1';
            queryParams.push(projectId);
        }
        query += `
      ORDER BY 
        t.priority DESC,
        t.order_index,
        t.created_at
      LIMIT 1
    `;
        const result = await database_1.pool.query(query, queryParams);
        return result.rows[0] || null;
    }
}
exports.TaskService = TaskService;
