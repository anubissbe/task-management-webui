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
const workspace_1 = __importDefault(require("./workspace"));
const mcp_1 = __importDefault(require("./mcp"));
const reports_1 = require("./reports");
const notifications_1 = __importDefault(require("./notifications"));
const auth_2 = require("../middleware/auth");
const workspace_2 = require("../middleware/workspace");
const router = (0, express_1.Router)();
const projectController = new projectController_1.ProjectController();
const taskController = new taskController_1.TaskController();
// Health check
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Authentication routes
router.use('/auth', auth_1.default);
// Workspace routes (protected by authentication)
router.use('/workspaces', workspace_1.default);
// Project routes (protected by authentication and workspace context)
router.get('/projects', auth_2.authenticate, workspace_2.workspaceContext, projectController.getAllProjects);
router.get('/projects/:id', auth_2.authenticate, workspace_2.workspaceContext, projectController.getProjectById);
router.post('/projects', auth_2.authenticate, workspace_2.workspaceContext, projectController.createProject);
router.put('/projects/:id', auth_2.authenticate, workspace_2.workspaceContext, projectController.updateProject);
router.delete('/projects/:id', auth_2.authenticate, workspace_2.workspaceContext, projectController.deleteProject);
router.get('/projects/:id/stats', auth_2.authenticate, workspace_2.workspaceContext, projectController.getProjectStats);
// Task routes (protected by authentication and workspace context)
router.get('/projects/:projectId/tasks', auth_2.authenticate, workspace_2.workspaceContext, taskController.getTasksByProject);
router.get('/tasks/:id', auth_2.authenticate, workspace_2.workspaceContext, taskController.getTaskById);
router.get('/tasks/:id/subtasks', auth_2.authenticate, workspace_2.workspaceContext, taskController.getSubtasks);
router.post('/tasks', auth_2.authenticate, workspace_2.workspaceContext, taskController.createTask);
router.put('/tasks/:id', auth_2.authenticate, workspace_2.workspaceContext, taskController.updateTask);
router.patch('/tasks/:id/status', auth_2.authenticate, workspace_2.workspaceContext, taskController.updateTaskStatus);
router.delete('/tasks/:id', auth_2.authenticate, workspace_2.workspaceContext, taskController.deleteTask);
router.get('/tasks/:id/history', auth_2.authenticate, workspace_2.workspaceContext, taskController.getTaskHistory);
router.post('/tasks/:id/test-results', auth_2.authenticate, workspace_2.workspaceContext, taskController.addTestResult);
router.get('/tasks/:id/test-results', auth_2.authenticate, workspace_2.workspaceContext, taskController.getTestResults);
router.get('/next-task', auth_2.authenticate, workspace_2.workspaceContext, taskController.getNextTask);
// Webhook routes
router.use('/webhooks', webhooks_1.default);
// MCP Integration routes (protected by authentication and workspace context)
router.use('/mcp', mcp_1.default);
// Reporting routes (protected by authentication and workspace context)
router.use('/reports', reports_1.reportRoutes);
// Notification routes (protected by authentication and workspace context)
router.use('/notifications', notifications_1.default);
exports.default = router;
