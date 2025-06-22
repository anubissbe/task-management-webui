import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { workspaceContext } from '../middleware/workspace';
import NotificationController from '../controllers/notificationController';

const router = Router();

// Public unsubscribe endpoint (no auth required)
router.get('/unsubscribe', NotificationController.unsubscribe);

// Health check endpoint (no auth required)
router.get('/health', NotificationController.getNotificationHealth);

// Apply authentication to remaining routes
router.use(authenticate);
router.use(workspaceContext);

// Get user notification preferences
router.get('/preferences', NotificationController.getNotificationPreferences);

// Update user notification preferences
router.put('/preferences', NotificationController.updateNotificationPreferences);

// Test notification (development only)
router.post('/test', NotificationController.testNotification);

// Manually trigger digest (admin/development)
router.post('/trigger-digest', NotificationController.triggerDigest);

// Get notification statistics
router.get('/stats', NotificationController.getNotificationStats);

export default router;