import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings, Play, BarChart3, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
  last_triggered_at?: string;
  failure_count: number;
}

interface WebhookTemplate {
  name: string;
  description: string;
  url_pattern: string;
  events: string[];
  headers: Record<string, string>;
  payload_format: string;
}

interface WebhookStats {
  webhook_id: string;
  webhook_name: string;
  statistics: {
    total_deliveries: number;
    successful_deliveries: number;
    failed_deliveries: number;
    success_rate: string;
    average_retries: number;
    last_triggered?: string;
    deliveries_24h: number;
    deliveries_7d: number;
    failure_count: number;
    active: boolean;
  };
}

const WEBHOOK_EVENTS = [
  { value: 'task.created', label: 'Task Created' },
  { value: 'task.updated', label: 'Task Updated' },
  { value: 'task.completed', label: 'Task Completed' },
  { value: 'task.deleted', label: 'Task Deleted' },
  { value: 'project.created', label: 'Project Created' },
  { value: 'project.updated', label: 'Project Updated' },
  { value: 'project.completed', label: 'Project Completed' },
  { value: 'project.deleted', label: 'Project Deleted' }
];

export const WebhookManagement: React.FC = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [templates, setTemplates] = useState<WebhookTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [showStats, setShowStats] = useState<string | null>(null);
  const [webhookStats, setWebhookStats] = useState<WebhookStats | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: '',
    active: true,
    max_retries: 3,
    retry_delay: 1000,
    headers: {} as Record<string, string>
  });

  useEffect(() => {
    fetchWebhooks();
    fetchTemplates();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data);
      }
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/webhooks/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch webhook templates:', error);
    }
  };

  const fetchWebhookStats = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setWebhookStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch webhook stats:', error);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchWebhooks();
        setShowCreateForm(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(`Failed to create webhook: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create webhook:', error);
      alert('Failed to create webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchWebhooks();
      } else {
        alert('Failed to delete webhook');
      }
    } catch (error) {
      console.error('Failed to delete webhook:', error);
      alert('Failed to delete webhook');
    }
  };

  const handleTestWebhook = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/webhooks/${id}/test`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Test result: ${result.test_result.success ? 'Success' : 'Failed'}\nStatus: ${result.test_result.status}\nLatency: ${result.test_result.latency}ms`);
      } else {
        alert('Failed to test webhook');
      }
    } catch (error) {
      console.error('Failed to test webhook:', error);
      alert('Failed to test webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (webhook: Webhook) => {
    try {
      const response = await fetch(`/api/webhooks/${webhook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !webhook.active })
      });

      if (response.ok) {
        await fetchWebhooks();
      } else {
        alert('Failed to update webhook');
      }
    } catch (error) {
      console.error('Failed to update webhook:', error);
      alert('Failed to update webhook');
    }
  };

  const handleUseTemplate = (template: WebhookTemplate) => {
    setFormData({
      ...formData,
      name: template.name,
      url: template.url_pattern,
      events: template.events,
      headers: template.headers
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      events: [],
      secret: '',
      active: true,
      max_retries: 3,
      retry_delay: 1000,
      headers: {}
    });
  };

  const handleEventToggle = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Webhook Management
        </h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Webhook
        </button>
      </div>

      {/* Webhook Templates */}
      {templates.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Quick Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleUseTemplate(template)}
              >
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {template.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.events.slice(0, 2).map(event => (
                    <span
                      key={event}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    >
                      {event}
                    </span>
                  ))}
                  {template.events.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{template.events.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Webhooks List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Webhooks ({webhooks.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {webhooks.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              No webhooks configured. Create your first webhook to get started.
            </div>
          ) : (
            webhooks.map((webhook) => (
              <div key={webhook.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${webhook.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {webhook.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {webhook.url}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {webhook.events.map(event => (
                        <span
                          key={event}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Created {formatDate(webhook.created_at)}
                      </span>
                      {webhook.last_triggered_at && (
                        <span className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Last triggered {formatDate(webhook.last_triggered_at)}
                        </span>
                      )}
                      {webhook.failure_count > 0 && (
                        <span className="flex items-center text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {webhook.failure_count} failures
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setShowStats(webhook.id);
                        fetchWebhookStats(webhook.id);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      title="View Statistics"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleTestWebhook(webhook.id)}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                      title="Test Webhook"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedWebhook(webhook)}
                      className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      title="Edit Webhook"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(webhook)}
                      className={`px-3 py-1 rounded text-sm ${
                        webhook.active
                          ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                          : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                      }`}
                    >
                      {webhook.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      title="Delete Webhook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Webhook Modal */}
      {(showCreateForm || selectedWebhook) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {selectedWebhook ? 'Edit Webhook' : 'Create New Webhook'}
            </h2>
            <form onSubmit={handleCreateWebhook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://api.example.com/webhook"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Events
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WEBHOOK_EVENTS.map(event => (
                    <label key={event.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.events.includes(event.value)}
                        onChange={() => handleEventToggle(event.value)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {event.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Secret (Optional)
                </label>
                <input
                  type="password"
                  value={formData.secret}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="For HMAC signature verification"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Retries
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.max_retries}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_retries: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Retry Delay (ms)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="300000"
                    value={formData.retry_delay}
                    onChange={(e) => setFormData(prev => ({ ...prev, retry_delay: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setSelectedWebhook(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.events.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : selectedWebhook ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Webhook Statistics Modal */}
      {showStats && webhookStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Webhook Statistics: {webhookStats.webhook_name}
              </h2>
              <button
                onClick={() => {
                  setShowStats(null);
                  setWebhookStats(null);
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Deliveries
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {webhookStats.statistics.total_deliveries}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Success Rate
                </h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {webhookStats.statistics.success_rate}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Last 24 Hours
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {webhookStats.statistics.deliveries_24h}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Retries
                </h3>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {webhookStats.statistics.average_retries}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};