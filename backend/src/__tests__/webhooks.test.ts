import request from 'supertest';
import express from 'express';
import { WebhookController } from '../controllers/webhookController';
import { webhookService } from '../services/webhookService';

// Mock the webhook service
jest.mock('../services/webhookService');

const app = express();
app.use(express.json());

// Setup webhook routes for testing
app.get('/webhooks', WebhookController.getWebhooks);
app.get('/webhooks/templates', WebhookController.getWebhookTemplates);
app.get('/webhooks/:id', WebhookController.getWebhook);
app.post('/webhooks', WebhookController.createWebhook);
app.put('/webhooks/:id', WebhookController.updateWebhook);
app.delete('/webhooks/:id', WebhookController.deleteWebhook);
app.post('/webhooks/:id/test', WebhookController.testWebhook);
app.get('/webhooks/:id/deliveries', WebhookController.getWebhookDeliveries);
app.get('/webhooks/:id/stats', WebhookController.getWebhookStats);

describe('Webhook API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /webhooks', () => {
    it('should return all webhooks', async () => {
      const response = await request(app)
        .get('/webhooks')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter webhooks by project_id', async () => {
      const projectId = 'test-project-id';
      const response = await request(app)
        .get(`/webhooks?project_id=${projectId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /webhooks', () => {
    const validWebhookData = {
      name: 'Test Webhook',
      url: 'https://api.example.com/webhook',
      events: ['task.created', 'task.completed'],
      secret: 'test-secret',
      active: true
    };

    it('should create a new webhook with valid data', async () => {
      const response = await request(app)
        .post('/webhooks')
        .send(validWebhookData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: validWebhookData.name,
        url: validWebhookData.url,
        events: validWebhookData.events,
        active: true
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.created_at).toBeDefined();
    });

    it('should reject webhook with invalid URL', async () => {
      const invalidData = {
        ...validWebhookData,
        url: 'invalid-url'
      };

      const response = await request(app)
        .post('/webhooks')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('Invalid URL format');
    });

    it('should reject webhook with invalid events', async () => {
      const invalidData = {
        ...validWebhookData,
        events: ['invalid.event', 'task.created']
      };

      const response = await request(app)
        .post('/webhooks')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('Invalid events');
      expect(response.body.valid_events).toBeDefined();
    });

    it('should reject webhook with missing required fields', async () => {
      const invalidData = {
        name: 'Test Webhook'
        // Missing url and events
      };

      const response = await request(app)
        .post('/webhooks')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('Missing required fields');
    });

    it('should reject webhook with invalid retry settings', async () => {
      const invalidData = {
        ...validWebhookData,
        max_retries: 15 // Too high
      };

      const response = await request(app)
        .post('/webhooks')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('max_retries must be between 0 and 10');
    });
  });

  describe('GET /webhooks/:id', () => {
    it('should return 404 for non-existent webhook', async () => {
      const response = await request(app)
        .get('/webhooks/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Webhook not found');
    });
  });

  describe('PUT /webhooks/:id', () => {
    it('should return 404 for non-existent webhook', async () => {
      const response = await request(app)
        .put('/webhooks/non-existent-id')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.error).toBe('Webhook not found');
    });
  });

  describe('DELETE /webhooks/:id', () => {
    it('should return 404 for non-existent webhook', async () => {
      const response = await request(app)
        .delete('/webhooks/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Webhook not found');
    });
  });

  describe('POST /webhooks/:id/test', () => {
    it('should return 404 for non-existent webhook', async () => {
      const response = await request(app)
        .post('/webhooks/non-existent-id/test')
        .expect(404);

      expect(response.body.error).toBe('Webhook not found');
    });
  });

  describe('GET /webhooks/templates', () => {
    it('should return webhook templates', async () => {
      const response = await request(app)
        .get('/webhooks/templates')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check template structure
      const template = response.body[0];
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('url_pattern');
      expect(template).toHaveProperty('events');
      expect(template).toHaveProperty('payload_format');
    });
  });

  describe('GET /webhooks/:id/deliveries', () => {
    it('should return 404 for non-existent webhook', async () => {
      const response = await request(app)
        .get('/webhooks/non-existent-id/deliveries')
        .expect(404);

      expect(response.body.error).toBe('Webhook not found');
    });
  });

  describe('GET /webhooks/:id/stats', () => {
    it('should return 404 for non-existent webhook', async () => {
      const response = await request(app)
        .get('/webhooks/non-existent-id/stats')
        .expect(404);

      expect(response.body.error).toBe('Webhook not found');
    });
  });
});

describe('Webhook Service', () => {
  describe('verifySignature', () => {
    it('should have verifySignature method', () => {
      // Check that the static method exists
      expect(typeof (webhookService.constructor as any).verifySignature).toBe('function');
    });

    it('should reject invalid signature format', () => {
      // Check that the static method exists and can be called
      const WebhookServiceClass = webhookService.constructor as any;
      expect(typeof WebhookServiceClass.verifySignature).toBe('function');
      
      // Test invalid signature format
      const result = WebhookServiceClass.verifySignature(
        '{"test": "data"}', 
        'invalid-format', 
        'secret'
      );
      expect(result).toBe(false);
    });
  });
});

describe('Webhook Integration Tests', () => {
  let webhookId: string;

  beforeAll(async () => {
    // Create a test webhook for integration tests
    const webhookData = {
      name: 'Integration Test Webhook',
      url: 'https://httpbin.org/post',
      events: ['task.created'],
      active: true
    };

    const response = await request(app)
      .post('/webhooks')
      .send(webhookData);

    webhookId = response.body.id;
  });

  afterAll(async () => {
    // Clean up test webhook
    if (webhookId) {
      await request(app)
        .delete(`/webhooks/${webhookId}`);
    }
  });

  it('should complete full webhook lifecycle', async () => {
    // Get the created webhook
    const getResponse = await request(app)
      .get(`/webhooks/${webhookId}`)
      .expect(200);

    expect(getResponse.body.name).toBe('Integration Test Webhook');

    // Update the webhook
    const updateData = {
      name: 'Updated Integration Test Webhook',
      events: ['task.created', 'task.completed']
    };

    const updateResponse = await request(app)
      .put(`/webhooks/${webhookId}`)
      .send(updateData)
      .expect(200);

    expect(updateResponse.body.name).toBe(updateData.name);
    expect(updateResponse.body.events).toEqual(updateData.events);

    // Test the webhook (might fail due to network, but should not error)
    await request(app)
      .post(`/webhooks/${webhookId}/test`)
      .expect(200);

    // Get webhook statistics
    const statsResponse = await request(app)
      .get(`/webhooks/${webhookId}/stats`)
      .expect(200);

    expect(statsResponse.body.webhook_id).toBe(webhookId);
    expect(statsResponse.body.statistics).toBeDefined();

    // Get webhook deliveries
    const deliveriesResponse = await request(app)
      .get(`/webhooks/${webhookId}/deliveries`)
      .expect(200);

    expect(deliveriesResponse.body.deliveries).toBeDefined();
    expect(deliveriesResponse.body.pagination).toBeDefined();
  });
});

describe('Webhook Event Validation', () => {
  const validEvents = [
    'task.created',
    'task.updated',
    'task.completed',
    'task.deleted',
    'project.created',
    'project.updated',
    'project.completed',
    'project.deleted'
  ];

  validEvents.forEach(event => {
    it(`should accept valid event: ${event}`, async () => {
      const webhookData = {
        name: `Test Webhook for ${event}`,
        url: 'https://api.example.com/webhook',
        events: [event]
      };

      const response = await request(app)
        .post('/webhooks')
        .send(webhookData)
        .expect(201);

      expect(response.body.events).toContain(event);
    });
  });

  it('should reject unknown events', async () => {
    const webhookData = {
      name: 'Test Webhook',
      url: 'https://api.example.com/webhook',
      events: ['unknown.event']
    };

    const response = await request(app)
      .post('/webhooks')
      .send(webhookData)
      .expect(400);

    expect(response.body.error).toContain('Invalid events');
  });
});

describe('Webhook Security', () => {
  it('should accept HTTPS URLs', async () => {
    const webhookData = {
      name: 'HTTPS Webhook',
      url: 'https://secure.example.com/webhook',
      events: ['task.created']
    };

    await request(app)
      .post('/webhooks')
      .send(webhookData)
      .expect(201);
  });

  it('should accept HTTP URLs in development', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const webhookData = {
      name: 'HTTP Webhook',
      url: 'http://example.com/webhook',
      events: ['task.created']
    };

    await request(app)
      .post('/webhooks')
      .send(webhookData)
      .expect(201);

    process.env.NODE_ENV = originalEnv;
  });
});