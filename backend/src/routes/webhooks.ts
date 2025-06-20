import express from 'express';
import { WebhookController } from '../controllers/webhookController';

const router = express.Router();

// Get all webhooks
router.get('/', WebhookController.getWebhooks);

// Get webhook templates
router.get('/templates', WebhookController.getWebhookTemplates);

// Get specific webhook
router.get('/:id', WebhookController.getWebhook);

// Create new webhook
router.post('/', WebhookController.createWebhook);

// Update webhook
router.put('/:id', WebhookController.updateWebhook);

// Delete webhook
router.delete('/:id', WebhookController.deleteWebhook);

// Test webhook
router.post('/:id/test', WebhookController.testWebhook);

// Get webhook deliveries
router.get('/:id/deliveries', WebhookController.getWebhookDeliveries);

// Get webhook statistics
router.get('/:id/stats', WebhookController.getWebhookStats);

export default router;