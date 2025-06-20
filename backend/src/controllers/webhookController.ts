import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Webhook, WebhookEvent, WebhookDelivery } from '../types';
import { webhookService } from '../services/webhookService';

// In-memory storage for demo - replace with database in production
const webhooks: Map<string, Webhook> = new Map();
const deliveries: Map<string, WebhookDelivery> = new Map();

export class WebhookController {
  /**
   * Get all webhooks
   */
  static async getWebhooks(req: Request, res: Response): Promise<void> {
    try {
      const { project_id } = req.query;
      
      let filteredWebhooks = Array.from(webhooks.values());
      
      if (project_id) {
        filteredWebhooks = filteredWebhooks.filter(w => 
          w.project_id === project_id || !w.project_id
        );
      }
      
      res.json(filteredWebhooks);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      res.status(500).json({ error: 'Failed to fetch webhooks' });
    }
  }

  /**
   * Get webhook by ID
   */
  static async getWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const webhook = webhooks.get(id);
      
      if (!webhook) {
        res.status(404).json({ error: 'Webhook not found' });
        return;
      }
      
      res.json(webhook);
    } catch (error) {
      console.error('Error fetching webhook:', error);
      res.status(500).json({ error: 'Failed to fetch webhook' });
    }
  }

  /**
   * Create new webhook
   */
  static async createWebhook(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        url,
        events,
        secret,
        active = true,
        max_retries = 3,
        retry_delay = 1000,
        headers = {},
        project_id
      } = req.body;

      // Validation
      if (!name || !url || !events || !Array.isArray(events)) {
        res.status(400).json({ 
          error: 'Missing required fields: name, url, events' 
        });
        return;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        res.status(400).json({ error: 'Invalid URL format' });
        return;
      }

      // Validate events
      const validEvents: WebhookEvent[] = [
        'task.created', 'task.updated', 'task.completed', 'task.deleted',
        'project.created', 'project.updated', 'project.completed', 'project.deleted'
      ];
      
      const invalidEvents = events.filter((e: string) => !validEvents.includes(e as WebhookEvent));
      if (invalidEvents.length > 0) {
        res.status(400).json({ 
          error: `Invalid events: ${invalidEvents.join(', ')}`,
          valid_events: validEvents
        });
        return;
      }

      // Validate retry settings
      if (max_retries < 0 || max_retries > 10) {
        res.status(400).json({ 
          error: 'max_retries must be between 0 and 10' 
        });
        return;
      }

      if (retry_delay < 100 || retry_delay > 300000) {
        res.status(400).json({ 
          error: 'retry_delay must be between 100ms and 300000ms (5 minutes)' 
        });
        return;
      }

      const webhook: Webhook = {
        id: uuidv4(),
        name: name.trim(),
        url: url.trim(),
        events,
        secret: secret?.trim(),
        active,
        max_retries,
        retry_delay,
        headers: headers || {},
        project_id: project_id?.trim(),
        failure_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      };

      webhooks.set(webhook.id, webhook);
      
      res.status(201).json(webhook);
    } catch (error) {
      console.error('Error creating webhook:', error);
      res.status(500).json({ error: 'Failed to create webhook' });
    }
  }

  /**
   * Update webhook
   */
  static async updateWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const existingWebhook = webhooks.get(id);
      
      if (!existingWebhook) {
        res.status(404).json({ error: 'Webhook not found' });
        return;
      }

      const {
        name,
        url,
        events,
        secret,
        active,
        max_retries,
        retry_delay,
        headers,
        project_id
      } = req.body;

      // Validate URL if provided
      if (url) {
        try {
          new URL(url);
        } catch {
          res.status(400).json({ error: 'Invalid URL format' });
          return;
        }
      }

      // Validate events if provided
      if (events) {
        const validEvents: WebhookEvent[] = [
          'task.created', 'task.updated', 'task.completed', 'task.deleted',
          'project.created', 'project.updated', 'project.completed', 'project.deleted'
        ];
        
        const invalidEvents = events.filter((e: string) => !validEvents.includes(e as WebhookEvent));
        if (invalidEvents.length > 0) {
          res.status(400).json({ 
            error: `Invalid events: ${invalidEvents.join(', ')}`,
            valid_events: validEvents
          });
          return;
        }
      }

      // Validate retry settings if provided
      if (max_retries !== undefined && (max_retries < 0 || max_retries > 10)) {
        res.status(400).json({ 
          error: 'max_retries must be between 0 and 10' 
        });
        return;
      }

      if (retry_delay !== undefined && (retry_delay < 100 || retry_delay > 300000)) {
        res.status(400).json({ 
          error: 'retry_delay must be between 100ms and 300000ms (5 minutes)' 
        });
        return;
      }

      const updatedWebhook: Webhook = {
        ...existingWebhook,
        name: name?.trim() ?? existingWebhook.name,
        url: url?.trim() ?? existingWebhook.url,
        events: events ?? existingWebhook.events,
        secret: secret?.trim() ?? existingWebhook.secret,
        active: active ?? existingWebhook.active,
        max_retries: max_retries ?? existingWebhook.max_retries,
        retry_delay: retry_delay ?? existingWebhook.retry_delay,
        headers: headers ?? existingWebhook.headers,
        project_id: project_id?.trim() ?? existingWebhook.project_id,
        updated_at: new Date()
      };

      webhooks.set(id, updatedWebhook);
      
      res.json(updatedWebhook);
    } catch (error) {
      console.error('Error updating webhook:', error);
      res.status(500).json({ error: 'Failed to update webhook' });
    }
  }

  /**
   * Delete webhook
   */
  static async deleteWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!webhooks.has(id)) {
        res.status(404).json({ error: 'Webhook not found' });
        return;
      }

      // Cancel any pending deliveries
      webhookService.cancelPendingDeliveries(id);
      
      webhooks.delete(id);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      res.status(500).json({ error: 'Failed to delete webhook' });
    }
  }

  /**
   * Test webhook endpoint
   */
  static async testWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const webhook = webhooks.get(id);
      
      if (!webhook) {
        res.status(404).json({ error: 'Webhook not found' });
        return;
      }

      const result = await webhookService.testWebhook(webhook);
      
      res.json({
        webhook_id: id,
        test_result: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error testing webhook:', error);
      res.status(500).json({ error: 'Failed to test webhook' });
    }
  }

  /**
   * Get webhook deliveries
   */
  static async getWebhookDeliveries(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      if (!webhooks.has(id)) {
        res.status(404).json({ error: 'Webhook not found' });
        return;
      }

      const webhookDeliveries = Array.from(deliveries.values())
        .filter(d => d.webhook_id === id)
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .slice(Number(offset), Number(offset) + Number(limit));

      const total = Array.from(deliveries.values())
        .filter(d => d.webhook_id === id).length;

      res.json({
        deliveries: webhookDeliveries,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          has_more: Number(offset) + Number(limit) < total
        }
      });
    } catch (error) {
      console.error('Error fetching webhook deliveries:', error);
      res.status(500).json({ error: 'Failed to fetch webhook deliveries' });
    }
  }

  /**
   * Get webhook templates for common services
   */
  static async getWebhookTemplates(_req: Request, res: Response): Promise<void> {
    try {
      const templates = [
        {
          name: 'Slack',
          description: 'Send notifications to Slack channel',
          url_pattern: 'https://hooks.slack.com/services/...',
          headers: {
            'Content-Type': 'application/json'
          },
          events: ['task.completed', 'project.completed'],
          payload_format: 'slack'
        },
        {
          name: 'Discord',
          description: 'Send notifications to Discord channel',
          url_pattern: 'https://discord.com/api/webhooks/...',
          headers: {
            'Content-Type': 'application/json'
          },
          events: ['task.created', 'task.completed'],
          payload_format: 'discord'
        },
        {
          name: 'Microsoft Teams',
          description: 'Send notifications to Teams channel',
          url_pattern: 'https://outlook.office.com/webhook/...',
          headers: {
            'Content-Type': 'application/json'
          },
          events: ['project.updated', 'task.completed'],
          payload_format: 'teams'
        },
        {
          name: 'Generic HTTP',
          description: 'Standard HTTP POST with JSON payload',
          url_pattern: 'https://api.example.com/webhooks',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer your-token-here'
          },
          events: ['task.created', 'task.updated', 'task.completed'],
          payload_format: 'standard'
        }
      ];

      res.json(templates);
    } catch (error) {
      console.error('Error fetching webhook templates:', error);
      res.status(500).json({ error: 'Failed to fetch webhook templates' });
    }
  }

  /**
   * Get webhook statistics
   */
  static async getWebhookStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!webhooks.has(id)) {
        res.status(404).json({ error: 'Webhook not found' });
        return;
      }

      const webhook = webhooks.get(id)!;
      const webhookDeliveries = Array.from(deliveries.values())
        .filter(d => d.webhook_id === id);

      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const deliveries24h = webhookDeliveries.filter(d => d.created_at >= last24h);
      const deliveries7d = webhookDeliveries.filter(d => d.created_at >= last7d);

      const successful = webhookDeliveries.filter(d => d.delivered_at).length;
      const failed = webhookDeliveries.filter(d => !d.delivered_at).length;

      const averageRetries = webhookDeliveries.length > 0
        ? webhookDeliveries.reduce((sum, d) => sum + d.retry_count, 0) / webhookDeliveries.length
        : 0;

      res.json({
        webhook_id: id,
        webhook_name: webhook.name,
        statistics: {
          total_deliveries: webhookDeliveries.length,
          successful_deliveries: successful,
          failed_deliveries: failed,
          success_rate: webhookDeliveries.length > 0 
            ? ((successful / webhookDeliveries.length) * 100).toFixed(2) + '%'
            : '0%',
          average_retries: Number(averageRetries.toFixed(2)),
          last_triggered: webhook.last_triggered_at?.toISOString(),
          deliveries_24h: deliveries24h.length,
          deliveries_7d: deliveries7d.length,
          failure_count: webhook.failure_count,
          active: webhook.active
        },
        delivery_service_stats: webhookService.getDeliveryStats()
      });
    } catch (error) {
      console.error('Error fetching webhook statistics:', error);
      res.status(500).json({ error: 'Failed to fetch webhook statistics' });
    }
  }
}

// Helper function to trigger webhooks for events
export async function triggerWebhooksForEvent(
  event: WebhookEvent,
  data: any,
  previousData?: any,
  projectId?: string
): Promise<void> {
  try {
    const relevantWebhooks = Array.from(webhooks.values()).filter(webhook => {
      // Check if webhook is active and listens to this event
      if (!webhook.active || !webhook.events.includes(event)) {
        return false;
      }
      
      // Check project-specific webhooks
      if (webhook.project_id && webhook.project_id !== projectId) {
        return false;
      }
      
      return true;
    });

    for (const webhook of relevantWebhooks) {
      try {
        const deliveryId = await webhookService.triggerWebhook(
          webhook,
          event,
          data,
          previousData
        );
        
        if (deliveryId) {
          // Update webhook last triggered time
          webhook.last_triggered_at = new Date();
          webhooks.set(webhook.id, webhook);
        }
      } catch (error) {
        console.error(`Failed to trigger webhook ${webhook.id}:`, error);
        
        // Increment failure count
        webhook.failure_count += 1;
        webhooks.set(webhook.id, webhook);
      }
    }
  } catch (error) {
    console.error('Error triggering webhooks for event:', error);
  }
}