"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const taskController_1 = require("../controllers/taskController");
const webhooks_1 = __importDefault(require("./webhooks"));
const auth_1 = __importDefault(require("./auth"));
// import { authenticate, optionalAuth } from '../middleware/auth';
const router = (0, express_1.Router)();
const projectController = new projectController_1.ProjectController();
const taskController = new taskController_1.TaskController();
// Health check
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Authentication routes
router.use('/auth', auth_1.default);
// Project routes (protected by authentication)
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
// Webhook routes
router.use('/webhooks', webhooks_1.default);
exports.default = router;
