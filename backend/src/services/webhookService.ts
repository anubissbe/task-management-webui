import crypto from 'crypto';
import axios, { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Webhook, WebhookDelivery, WebhookEvent, WebhookPayload, Task, Project } from '../types';

interface WebhookServiceConfig {
  defaultRetries: number;
  defaultRetryDelay: number;
  maxRetryDelay: number;
  requestTimeout: number;
  maxPayloadSize: number;
}

export class WebhookService {
  private config: WebhookServiceConfig;
  private deliveryQueue: Map<string, NodeJS.Timeout> = new Map();

  constructor(config?: Partial<WebhookServiceConfig>) {
    this.config = {
      defaultRetries: 3,
      defaultRetryDelay: 1000, // 1 second
      maxRetryDelay: 300000, // 5 minutes
      requestTimeout: 30000, // 30 seconds
      maxPayloadSize: 1024 * 1024, // 1MB
      ...config
    };
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(payload: string, secret: string): string {
    return 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
  }

  /**
   * Validate webhook URL format and security
   */
  private validateWebhookUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // Only allow HTTP/HTTPS
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return false;
      }
      
      // Prevent localhost and private IP ranges in production
      if (process.env.NODE_ENV === 'production') {
        const hostname = parsedUrl.hostname.toLowerCase();
        
        // Block localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return false;
        }
        
        // Block private IP ranges (basic check)
        if (hostname.startsWith('192.168.') || 
            hostname.startsWith('10.') || 
            hostname.startsWith('172.')) {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create webhook payload
   */
  private createPayload(
    event: WebhookEvent,
    data: Task | Project,
    webhook: Webhook,
    previousData?: Partial<Task | Project>
  ): WebhookPayload {
    return {
      event,
      timestamp: new Date().toISOString(),
      data,
      previous_data: previousData,
      webhook: {
        id: webhook.id,
        name: webhook.name
      }
    };
  }

  /**
   * Deliver webhook with retry logic
   */
  private async deliverWebhook(
    webhook: Webhook,
    payload: WebhookPayload,
    deliveryId: string,
    retryCount: number = 0
  ): Promise<WebhookDelivery> {
    const delivery: WebhookDelivery = {
      id: deliveryId,
      webhook_id: webhook.id,
      event: payload.event,
      payload: payload as any,
      retry_count: retryCount,
      created_at: new Date()
    };

    try {
      // Validate webhook URL
      if (!this.validateWebhookUrl(webhook.url)) {
        throw new Error('Invalid webhook URL');
      }

      const payloadString = JSON.stringify(payload);
      
      // Check payload size
      if (Buffer.byteLength(payloadString, 'utf8') > this.config.maxPayloadSize) {
        throw new Error('Payload too large');
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'ProjectHub-MCP-Webhooks/1.0',
        'X-Webhook-Event': payload.event,
        'X-Webhook-Delivery': deliveryId,
        'X-Webhook-Timestamp': payload.timestamp,
        ...webhook.headers
      };

      // Add HMAC signature if secret is provided
      if (webhook.secret) {
        headers['X-Hub-Signature-256'] = this.generateSignature(payloadString, webhook.secret);
      }

      // Make HTTP request
      const response: AxiosResponse = await axios.post(webhook.url, payload, {
        headers,
        timeout: this.config.requestTimeout,
        validateStatus: (status) => status >= 200 && status < 300,
        maxRedirects: 3
      });

      // Success
      delivery.response_status = response.status;
      delivery.response_body = typeof response.data === 'string' 
        ? response.data.substring(0, 1000) // Limit response body size
        : JSON.stringify(response.data).substring(0, 1000);
      delivery.delivered_at = new Date();

      console.log(`Webhook delivered successfully: ${webhook.name} (${webhook.id})`);
      
      return delivery;

    } catch (error: any) {
      // Handle delivery failure
      delivery.error_message = error.message || 'Unknown error';
      delivery.response_status = error.response?.status;
      
      if (error.response?.data) {
        delivery.response_body = typeof error.response.data === 'string'
          ? error.response.data.substring(0, 1000)
          : JSON.stringify(error.response.data).substring(0, 1000);
      }

      console.error(`Webhook delivery failed: ${webhook.name} (${webhook.id})`, error.message);

      // Schedule retry if attempts remaining
      if (retryCount < webhook.max_retries) {
        await this.scheduleRetry(webhook, payload, deliveryId, retryCount + 1);
      }

      return delivery;
    }
  }

  /**
   * Schedule webhook retry with exponential backoff
   */
  private async scheduleRetry(
    webhook: Webhook,
    payload: WebhookPayload,
    deliveryId: string,
    retryCount: number
  ): Promise<void> {
    const delay = Math.min(
      webhook.retry_delay * Math.pow(2, retryCount - 1),
      this.config.maxRetryDelay
    );

    console.log(`Scheduling webhook retry ${retryCount}/${webhook.max_retries} in ${delay}ms: ${webhook.name}`);

    const timeoutId = setTimeout(async () => {
      this.deliveryQueue.delete(deliveryId);
      await this.deliverWebhook(webhook, payload, deliveryId, retryCount);
    }, delay);

    this.deliveryQueue.set(deliveryId, timeoutId);
  }

  /**
   * Trigger webhook for specific event
   */
  async triggerWebhook(
    webhook: Webhook,
    event: WebhookEvent,
    data: Task | Project,
    previousData?: Partial<Task | Project>
  ): Promise<string> {
    // Check if webhook is active and listens to this event
    if (!webhook.active || !webhook.events.includes(event)) {
      return '';
    }

    // Create payload
    const payload = this.createPayload(event, data, webhook, previousData);
    const deliveryId = uuidv4();

    // Start delivery process (async, non-blocking)
    this.deliverWebhook(webhook, payload, deliveryId).catch(error => {
      console.error('Webhook delivery error:', error);
    });

    return deliveryId;
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(webhook: Webhook): Promise<{
    success: boolean;
    status?: number;
    response?: string;
    error?: string;
    latency: number;
  }> {
    const startTime = Date.now();
    
    const testPayload: WebhookPayload = {
      event: 'task.created',
      timestamp: new Date().toISOString(),
      data: {
        id: 'test-task-id',
        project_id: 'test-project-id',
        name: 'Test Task',
        description: 'This is a test webhook payload',
        status: 'pending',
        priority: 'medium',
        order_index: 0,
        created_at: new Date(),
        updated_at: new Date()
      } as Task,
      webhook: {
        id: webhook.id,
        name: webhook.name
      }
    };

    try {
      if (!this.validateWebhookUrl(webhook.url)) {
        throw new Error('Invalid webhook URL');
      }

      const payloadString = JSON.stringify(testPayload);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'ProjectHub-MCP-Webhooks/1.0 (Test)',
        'X-Webhook-Event': testPayload.event,
        'X-Webhook-Test': 'true',
        'X-Webhook-Timestamp': testPayload.timestamp,
        ...webhook.headers
      };

      if (webhook.secret) {
        headers['X-Hub-Signature-256'] = this.generateSignature(payloadString, webhook.secret);
      }

      const response = await axios.post(webhook.url, testPayload, {
        headers,
        timeout: this.config.requestTimeout,
        validateStatus: () => true, // Accept any status for testing
        maxRedirects: 3
      });

      const latency = Date.now() - startTime;

      return {
        success: response.status >= 200 && response.status < 300,
        status: response.status,
        response: typeof response.data === 'string' 
          ? response.data.substring(0, 500)
          : JSON.stringify(response.data).substring(0, 500),
        latency
      };

    } catch (error: any) {
      const latency = Date.now() - startTime;
      
      return {
        success: false,
        error: error.message || 'Unknown error',
        status: error.response?.status,
        latency
      };
    }
  }

  /**
   * Cancel pending webhook deliveries
   */
  cancelPendingDeliveries(webhookId?: string): number {
    let cancelled = 0;
    
    for (const [deliveryId, timeoutId] of this.deliveryQueue.entries()) {
      if (!webhookId || deliveryId.startsWith(webhookId)) {
        clearTimeout(timeoutId);
        this.deliveryQueue.delete(deliveryId);
        cancelled++;
      }
    }
    
    return cancelled;
  }

  /**
   * Get webhook delivery statistics
   */
  getDeliveryStats(): {
    pending: number;
    total_queued: number;
  } {
    return {
      pending: this.deliveryQueue.size,
      total_queued: this.deliveryQueue.size
    };
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    if (!signature.startsWith('sha256=')) {
      return false;
    }
    
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

// Export singleton instance
export const webhookService = new WebhookService();