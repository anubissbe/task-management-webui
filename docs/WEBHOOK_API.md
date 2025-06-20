# Webhook API Documentation

ProjectHub-MCP provides comprehensive webhook support for external integrations and automation. This document covers all webhook functionality, security features, and usage examples.

## 📋 Table of Contents

- [Overview](#overview)
- [API Endpoints](#api-endpoints)
- [Webhook Events](#webhook-events)
- [Security](#security)
- [Templates](#templates)
- [Testing](#testing)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Webhooks allow external services to receive real-time notifications when events occur in ProjectHub-MCP. Key features include:

- **Event-driven notifications** for tasks and projects
- **Retry logic** with exponential backoff
- **HMAC signature verification** for security
- **Rate limiting** to prevent abuse
- **Delivery tracking** and statistics
- **Template support** for common services

## 🔗 API Endpoints

### Get All Webhooks
```http
GET /api/webhooks
```

**Query Parameters:**
- `project_id` (optional): Filter webhooks by project

**Response:**
```json
[
  {
    "id": "webhook-uuid",
    "name": "Slack Notifications",
    "url": "https://hooks.slack.com/services/...",
    "events": ["task.completed", "project.completed"],
    "active": true,
    "created_at": "2025-06-20T10:00:00.000Z",
    "last_triggered_at": "2025-06-20T15:30:00.000Z",
    "failure_count": 0
  }
]
```

### Create Webhook
```http
POST /api/webhooks
```

**Request Body:**
```json
{
  "name": "My Webhook",
  "url": "https://api.example.com/webhook",
  "events": ["task.created", "task.completed"],
  "secret": "optional-secret-for-hmac",
  "active": true,
  "max_retries": 3,
  "retry_delay": 1000,
  "headers": {
    "Authorization": "Bearer your-token"
  },
  "project_id": "optional-project-uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "webhook-uuid",
  "name": "My Webhook",
  "url": "https://api.example.com/webhook",
  "events": ["task.created", "task.completed"],
  "active": true,
  "max_retries": 3,
  "retry_delay": 1000,
  "headers": {"Authorization": "Bearer your-token"},
  "failure_count": 0,
  "created_at": "2025-06-20T10:00:00.000Z",
  "updated_at": "2025-06-20T10:00:00.000Z"
}
```

### Update Webhook
```http
PUT /api/webhooks/:id
```

**Request Body:** Same as create, all fields optional

### Delete Webhook
```http
DELETE /api/webhooks/:id
```

**Response:** `204 No Content`

### Test Webhook
```http
POST /api/webhooks/:id/test
```

**Response:**
```json
{
  "webhook_id": "webhook-uuid",
  "test_result": {
    "success": true,
    "status": 200,
    "response": "OK",
    "latency": 145
  },
  "timestamp": "2025-06-20T10:00:00.000Z"
}
```

### Get Webhook Deliveries
```http
GET /api/webhooks/:id/deliveries?limit=50&offset=0
```

**Response:**
```json
{
  "deliveries": [
    {
      "id": "delivery-uuid",
      "webhook_id": "webhook-uuid",
      "event": "task.completed",
      "response_status": 200,
      "retry_count": 0,
      "delivered_at": "2025-06-20T10:00:00.000Z",
      "created_at": "2025-06-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

### Get Webhook Statistics
```http
GET /api/webhooks/:id/stats
```

**Response:**
```json
{
  "webhook_id": "webhook-uuid",
  "webhook_name": "My Webhook",
  "statistics": {
    "total_deliveries": 150,
    "successful_deliveries": 145,
    "failed_deliveries": 5,
    "success_rate": "96.67%",
    "average_retries": 0.12,
    "last_triggered": "2025-06-20T15:30:00.000Z",
    "deliveries_24h": 25,
    "deliveries_7d": 180,
    "failure_count": 2,
    "active": true
  }
}
```

### Get Webhook Templates
```http
GET /api/webhooks/templates
```

**Response:**
```json
[
  {
    "name": "Slack",
    "description": "Send notifications to Slack channel",
    "url_pattern": "https://hooks.slack.com/services/...",
    "events": ["task.completed", "project.completed"],
    "headers": {"Content-Type": "application/json"},
    "payload_format": "slack"
  }
]
```

## 📡 Webhook Events

### Task Events
- `task.created` - New task created
- `task.updated` - Task modified
- `task.completed` - Task status changed to completed
- `task.deleted` - Task deleted

### Project Events
- `project.created` - New project created
- `project.updated` - Project modified
- `project.completed` - Project status changed to completed
- `project.deleted` - Project deleted

## 📦 Webhook Payload

All webhook deliveries use this standardized payload format:

```json
{
  "event": "task.completed",
  "timestamp": "2025-06-20T10:00:00.000Z",
  "data": {
    "id": "task-uuid",
    "project_id": "project-uuid",
    "name": "Complete API documentation",
    "description": "Write comprehensive API docs",
    "status": "completed",
    "priority": "high",
    "estimated_hours": 8,
    "actual_hours": 6,
    "created_at": "2025-06-20T08:00:00.000Z",
    "updated_at": "2025-06-20T10:00:00.000Z",
    "completed_at": "2025-06-20T10:00:00.000Z"
  },
  "previous_data": {
    "status": "in_progress",
    "updated_at": "2025-06-20T09:30:00.000Z"
  },
  "webhook": {
    "id": "webhook-uuid",
    "name": "Task Completion Notifications"
  }
}
```

## 🔒 Security

### HMAC Signature Verification

When a secret is configured, webhooks include an HMAC signature:

**Header:** `X-Hub-Signature-256: sha256=abc123...`

**Verification (Node.js):**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Standard Headers

All webhook requests include these headers:

```http
Content-Type: application/json
User-Agent: ProjectHub-MCP-Webhooks/1.0
X-Webhook-Event: task.completed
X-Webhook-Delivery: delivery-uuid
X-Webhook-Timestamp: 2025-06-20T10:00:00.000Z
X-Hub-Signature-256: sha256=abc123... (if secret configured)
```

### URL Validation

- Only HTTP/HTTPS protocols allowed
- Production blocks localhost and private IPs
- Maximum 3 redirects followed
- 30-second timeout per request

## 📝 Templates

### Slack Integration

```json
{
  "name": "Slack Task Notifications",
  "url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
  "events": ["task.completed", "project.completed"],
  "headers": {
    "Content-Type": "application/json"
  }
}
```

**Slack webhook endpoint should transform payload:**
```javascript
// Transform ProjectHub payload to Slack format
const slackMessage = {
  "text": `✅ Task completed: ${data.data.name}`,
  "attachments": [{
    "color": "good",
    "fields": [
      {"title": "Project", "value": data.data.project_id, "short": true},
      {"title": "Priority", "value": data.data.priority, "short": true}
    ]
  }]
};
```

### Discord Integration

```json
{
  "name": "Discord Notifications",
  "url": "https://discord.com/api/webhooks/YOUR/WEBHOOK/URL",
  "events": ["task.created", "task.completed"],
  "headers": {
    "Content-Type": "application/json"
  }
}
```

### Generic HTTP Integration

```json
{
  "name": "Custom API Integration",
  "url": "https://api.yourservice.com/webhooks/projecthub",
  "events": ["task.created", "task.updated", "task.completed"],
  "secret": "your-webhook-secret",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-api-token"
  }
}
```

## 🧪 Testing

### Test Webhook Endpoint

Use the test endpoint to verify webhook configuration:

```bash
curl -X POST http://localhost:3001/api/webhooks/YOUR_WEBHOOK_ID/test \
  -H "Content-Type: application/json"
```

### Local Testing with ngrok

1. Install ngrok: `npm install -g ngrok`
2. Start local server: `ngrok http 3000`
3. Use ngrok URL in webhook configuration
4. Monitor requests in ngrok dashboard

### Webhook Receiver Example

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  
  // Verify signature if secret is configured
  if (signature && !verifySignature(payload, signature, 'your-secret')) {
    return res.status(401).send('Invalid signature');
  }
  
  const { event, data } = req.body;
  
  console.log(`Received ${event}:`, data.name);
  
  // Process the webhook
  switch (event) {
    case 'task.completed':
      console.log(`Task "${data.name}" completed!`);
      break;
    case 'project.completed':
      console.log(`Project "${data.name}" completed!`);
      break;
  }
  
  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Webhook receiver listening on port 3000');
});
```

## 🐛 Troubleshooting

### Common Issues

**Webhook not triggering:**
- Check webhook is active
- Verify events are correctly configured
- Check webhook URL is accessible
- Review delivery logs for errors

**Authentication failures:**
- Verify HMAC secret is correct
- Check signature verification implementation
- Ensure headers are properly set

**Delivery failures:**
- Check webhook endpoint returns 2xx status
- Verify SSL certificate is valid
- Check firewall/security groups
- Review timeout settings

### Debug Headers

Include these in webhook endpoint for debugging:

```javascript
app.post('/webhook', (req, res) => {
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Signature:', req.headers['x-hub-signature-256']);
  
  // Your webhook logic here
  
  res.status(200).send('OK');
});
```

### Webhook Logs

Monitor webhook deliveries via the deliveries endpoint:

```bash
curl http://localhost:3001/api/webhooks/YOUR_WEBHOOK_ID/deliveries
```

### Rate Limiting

If webhooks are rate limited:
- Reduce webhook frequency
- Implement exponential backoff
- Use project-specific webhooks
- Check `X-RateLimit-*` headers in responses

## 📊 Best Practices

### Performance
- Use HTTPS endpoints for security
- Implement idempotency in webhook handlers
- Process webhooks asynchronously
- Return 2xx status codes quickly

### Reliability
- Implement proper error handling
- Use exponential backoff for retries
- Store webhook data for replay capability
- Monitor webhook success rates

### Security
- Always verify HMAC signatures
- Use HTTPS for sensitive data
- Implement rate limiting on receiver
- Log webhook activity for auditing

### Monitoring
- Track webhook delivery rates
- Monitor response times
- Set up alerts for failures
- Review webhook statistics regularly

---

For additional support, see the [main API documentation](../README.md#api-documentation) or [create an issue](https://github.com/anubissbe/ProjectHub-Mcp/issues).