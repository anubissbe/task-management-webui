"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const taskController_1 = require("../controllers/taskController");
const router = (0, express_1.Router)();
const projectController = new projectController_1.ProjectController();
const taskController = new taskController_1.TaskController();
// Health check
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Project routes
router.get('/projects', projectController.getAllProjects);
router.get('/projects/:id', projectController.getProjectById);
router.post('/projects', projectController.createProject);
router.put('/projects/:id', projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);
router.get('/projects/:id/stats', projectController.getProjectStats);
// Task routes
router.get('/projects/:projectId/tasks', taskController.getTasksByProject);
router.get('/tasks/:id', taskController.getTaskById);
router.get('/tasks/:id/subtasks', taskController.getSubtasks);
router.post('/tasks', taskController.createTask);
router.put('/tasks/:id', taskController.updateTask);
router.patch('/tasks/:id/status', taskController.updateTaskStatus);
router.delete('/tasks/:id', taskController.deleteTask);
router.get('/tasks/:id/history', taskController.getTaskHistory);
router.post('/tasks/:id/test-results', taskController.addTestResult);
router.get('/tasks/:id/test-results', taskController.getTestResults);
router.get('/next-task', taskController.getNextTask);
exports.default = router;
