import { useState, useEffect } from 'react';
import { Save, Bell, Mail, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface NotificationPreferences {
  taskAssignment: boolean;
  taskDueDate: boolean;
  projectUpdates: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
  emailEnabled: boolean;
  digestTime: string;
  digestDays: number[];
  timezone: string;
}

interface RateLimitStatus {
  type: string;
  current: number;
  limit: number;
  windowMinutes: number;
  resetsAt: Date | null;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    taskAssignment: true,
    taskDueDate: true,
    projectUpdates: true,
    dailyDigest: false,
    weeklyDigest: true,
    emailEnabled: true,
    digestTime: '08:00',
    digestDays: [1, 2, 3, 4, 5],
    timezone: 'UTC'
  });

  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testingNotification, setTestingNotification] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
    loadRateLimitStatus();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  };

  const loadRateLimitStatus = async () => {
    try {
      const response = await fetch('/api/notifications/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.rateLimits) {
          setRateLimitStatus(data.rateLimits);
        }
      }
    } catch (error) {
      console.error('Failed to load rate limit status:', error);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Preferences saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to save preferences' });
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async (type: string) => {
    setTestingNotification(type);

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          type,
          taskId: 'test-task-id',
          projectId: 'test-project-id',
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Test ${type.replace('_', ' ')} notification sent!` });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to send test notification' });
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      setMessage({ type: 'error', text: 'Failed to send test notification' });
    } finally {
      setTestingNotification(null);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | string | number[]) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleDay = (dayValue: number) => {
    const newDays = preferences.digestDays.includes(dayValue)
      ? preferences.digestDays.filter(d => d !== dayValue)
      : [...preferences.digestDays, dayValue].sort();
    
    updatePreference('digestDays', newDays);
  };

  const formatRateLimitReset = (resetsAt: Date | null) => {
    if (!resetsAt) return 'No limit reached';
    const now = new Date();
    const diff = resetsAt.getTime() - now.getTime();
    if (diff <= 0) return 'Reset now';
    
    const minutes = Math.ceil(diff / (1000 * 60));
    if (minutes < 60) return `Resets in ${minutes}m`;
    const hours = Math.ceil(minutes / 60);
    return `Resets in ${hours}h`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            Notification Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage how and when you receive notifications about your projects and tasks.
          </p>
        </div>
        
        <button
          onClick={savePreferences}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Email Settings */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-6 h-6 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
        </div>

        <div className="space-y-6">
          {/* Master Email Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-600">Enable or disable all email notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailEnabled}
                onChange={(e) => updatePreference('emailEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Individual Notification Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: 'taskAssignment',
                title: 'Task Assignments',
                description: 'When you are assigned to a new task',
                testType: 'task_assignment'
              },
              {
                key: 'taskDueDate',
                title: 'Due Date Reminders',
                description: 'Reminders for upcoming task deadlines',
                testType: 'due_date_reminder'
              },
              {
                key: 'projectUpdates',
                title: 'Project Updates',
                description: 'When projects you\'re involved in are updated',
                testType: 'project_update'
              },
              {
                key: 'dailyDigest',
                title: 'Daily Digest',
                description: 'Daily summary of your tasks and activities',
                testType: 'daily_digest'
              },
              {
                key: 'weeklyDigest',
                title: 'Weekly Digest',
                description: 'Weekly summary and productivity insights',
                testType: 'weekly_digest'
              }
            ].map((item) => (
              <div key={item.key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                      onChange={(e) => updatePreference(item.key as keyof NotificationPreferences, e.target.checked)}
                      disabled={!preferences.emailEnabled}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                  </label>
                </div>
                
                {/* Test Button */}
                {preferences.emailEnabled && preferences[item.key as keyof NotificationPreferences] && (
                  <button
                    onClick={() => testNotification(item.testType)}
                    disabled={testingNotification === item.testType}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    {testingNotification === item.testType ? 'Sending...' : 'Send Test Email'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Digest Settings */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Digest Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Digest Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digest Delivery Time
            </label>
            <select
              value={preferences.digestTime}
              onChange={(e) => updatePreference('digestTime', e.target.value)}
              disabled={!preferences.emailEnabled || (!preferences.dailyDigest && !preferences.weeklyDigest)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              {Array.from({ length: 24 }, (_, i) => {
                const hour = i.toString().padStart(2, '0');
                const time12 = new Date(`2000-01-01 ${hour}:00`).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });
                return (
                  <option key={hour} value={`${hour}:00`}>
                    {hour}:00 ({time12})
                  </option>
                );
              })}
            </select>
            <p className="text-sm text-gray-600 mt-1">
              Time when daily and weekly digests will be delivered
            </p>
          </div>

          {/* Digest Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weekly Digest Day
            </label>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  disabled={!preferences.emailEnabled || !preferences.weeklyDigest}
                  className={`p-2 text-sm rounded-lg border transition-colors disabled:opacity-50 ${
                    preferences.digestDays.includes(day.value)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {day.label.slice(0, 3)}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Select which days you'd like to receive weekly digests
            </p>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) => updatePreference('timezone', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 mt-1">
              All digest times will be based on this timezone
            </p>
          </div>
        </div>
      </div>

      {/* Rate Limit Status */}
      {rateLimitStatus.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Email Rate Limits</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rateLimitStatus.map((status) => (
              <div key={status.type} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 capitalize mb-2">
                  {status.type.replace('_', ' ')}
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Used:</span>
                    <span className="font-medium">{status.current}/{status.limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Window:</span>
                    <span className="font-medium">{status.windowMinutes}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resets:</span>
                    <span className="font-medium text-blue-600">
                      {formatRateLimitReset(status.resetsAt)}
                    </span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        status.current >= status.limit 
                          ? 'bg-red-500' 
                          : status.current >= status.limit * 0.8 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((status.current / status.limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-600 mt-4">
            These limits help prevent email spam and ensure reliable delivery of important notifications.
          </p>
        </div>
      )}
    </div>
  );
}