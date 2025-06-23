import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';
import { workspaceContext } from '../middleware/workspace';
import { apiLimiter, reportLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting, authentication and workspace context to all routes
router.use(reportLimiter);
router.use(authenticate);
router.use(workspaceContext);

// Dashboard management
router.get('/dashboards', reportController.getDashboards.bind(reportController));
router.post('/dashboards', reportController.createDashboard.bind(reportController));
router.put('/dashboards/:id', reportController.updateDashboard.bind(reportController));
router.delete('/dashboards/:id', reportController.deleteDashboard.bind(reportController));

// Analytics endpoints
router.get('/advanced-metrics', reportController.getAdvancedMetrics.bind(reportController));
router.get('/burndown', reportController.getBurndownData.bind(reportController));

// Export functionality
router.post('/export/:id', reportController.exportReport.bind(reportController));
router.post('/schedule/:id', reportController.scheduleReport.bind(reportController));

export { router as reportRoutes };